import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, RotateCcw, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Process {
  id: string;
  arrival: number;
  burst: number;
}

interface GanttBlock {
  pid: string;
  start: number;
  end: number;
}

const RR = () => {
  const { toast } = useToast();
  const [processes, setProcesses] = useState<Process[]>([
    { id: "P1", arrival: 0, burst: 10 },
    { id: "P2", arrival: 1, burst: 5 },
    { id: "P3", arrival: 2, burst: 8 },
  ]);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [gantt, setGantt] = useState<GanttBlock[]>([]);
  const [results, setResults] = useState<any>(null);

  const getProcessColor = (pid: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-amber-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-cyan-500",
    ];
    const hash = pid.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const addProcess = () => {
    const newId = `P${processes.length + 1}`;
    setProcesses([...processes, { id: newId, arrival: 0, burst: 1 }]);
  };

  const removeProcess = (id: string) => {
    if (processes.length > 1) {
      setProcesses(processes.filter((p) => p.id !== id));
    }
  };

  const updateProcess = (id: string, field: keyof Process, value: string) => {
    setProcesses(
      processes.map((p) =>
        p.id === id ? { ...p, [field]: field === "id" ? value : Number(value) || 0 } : p
      )
    );
  };

  const runSimulation = () => {
    let simProcesses = processes.map(p => ({ ...p, remaining: p.burst, lastExecutionTime: p.arrival }));
    const readyQueue: any[] = [];
    const ganttChart: GanttBlock[] = [];
    const waitingTimes: { [key: string]: number } = {};
    const turnaroundTimes: { [key: string]: number } = {};
    let currentTime = 0;
    let finishedCount = 0;

    // Initial population of ready queue
    const initialProcesses = simProcesses.filter(p => p.arrival <= currentTime).sort((a,b) => a.arrival - b.arrival);
    readyQueue.push(...initialProcesses);
    simProcesses = simProcesses.filter(p => p.arrival > currentTime);

    while (finishedCount < processes.length) {
      if (readyQueue.length === 0) {
        const nextArrivalTime = Math.min(...simProcesses.map(p => p.arrival));
        currentTime = nextArrivalTime;
        const newlyArrived = simProcesses.filter(p => p.arrival <= currentTime).sort((a,b) => a.arrival - b.arrival);
        readyQueue.push(...newlyArrived);
        simProcesses = simProcesses.filter(p => p.arrival > currentTime);
        continue;
      }

      const currentProcess = readyQueue.shift();
      const executeTime = Math.min(currentProcess.remaining, timeQuantum);
      const startTime = currentTime;
      
      waitingTimes[currentProcess.id] = (waitingTimes[currentProcess.id] || 0) + (startTime - currentProcess.lastExecutionTime);
      
      currentTime += executeTime;
      currentProcess.remaining -= executeTime;

      if (ganttChart.length > 0 && ganttChart[ganttChart.length - 1].pid === currentProcess.id) {
        ganttChart[ganttChart.length - 1].end = currentTime;
      } else {
        ganttChart.push({ pid: currentProcess.id, start: startTime, end: currentTime });
      }

      // Add newly arrived processes to the ready queue
      const newlyArrived = simProcesses.filter(p => p.arrival <= currentTime).sort((a,b) => a.arrival - b.arrival);
      readyQueue.push(...newlyArrived);
      simProcesses = simProcesses.filter(p => p.arrival > currentTime);

      if (currentProcess.remaining > 0) {
        currentProcess.lastExecutionTime = currentTime;
        readyQueue.push(currentProcess);
      } else {
        finishedCount++;
        const originalProcess = processes.find(p => p.id === currentProcess.id)!;
        turnaroundTimes[currentProcess.id] = currentTime - originalProcess.arrival;
      }
    }

    const avgWaiting =
      Object.values(waitingTimes).reduce((a, b) => a + b, 0) / processes.length;
    const avgTurnaround =
      Object.values(turnaroundTimes).reduce((a, b) => a + b, 0) / processes.length;

    setGantt(ganttChart);
    setResults({
      waitingTimes,
      turnaroundTimes,
      avgWaiting: avgWaiting.toFixed(2),
      avgTurnaround: avgTurnaround.toFixed(2),
    });

    toast({
      title: "Simulation Complete",
      description: `Average Waiting Time: ${avgWaiting.toFixed(2)}`,
    });
  };

  const reset = () => {
    setGantt([]);
    setResults(null);
  };

  const saveExperiment = () => {
    toast({
      title: "Experiment Saved",
      description: "Your simulation has been saved to your progress.",
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Round Robin (RR)</h1>
          <p className="text-muted-foreground">
            Preemptive scheduling where each process is assigned a fixed time slice (time quantum).
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Process Table</h2>
                <Button onClick={addProcess} size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Process
                </Button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Process ID</div>
                  <div className="col-span-3">Arrival</div>
                  <div className="col-span-3">Burst</div>
                  <div className="col-span-2"></div>
                </div>

                {processes.map((p) => (
                  <div key={p.id} className="grid grid-cols-12 gap-2">
                    <Input
                      className="col-span-4"
                      value={p.id}
                      onChange={(e) => updateProcess(p.id, "id", e.target.value)}
                    />
                    <Input
                      className="col-span-3"
                      type="number"
                      value={p.arrival}
                      onChange={(e) => updateProcess(p.id, "arrival", e.target.value)}
                      min="0"
                    />
                    <Input
                      className="col-span-3"
                      type="number"
                      value={p.burst}
                      onChange={(e) => updateProcess(p.id, "burst", e.target.value)}
                      min="1"
                    />
                    <Button
                      className="col-span-2"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProcess(p.id)}
                      disabled={processes.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Controls</h2>
              <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-quantum">Time Quantum</Label>
                    <Input 
                      id="time-quantum"
                      type="number"
                      value={timeQuantum}
                      onChange={(e) => setTimeQuantum(Number(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={runSimulation} className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Run Simulation
                    </Button>
                    <Button onClick={reset} variant="outline" className="flex-1">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    <Button onClick={saveExperiment} variant="outline" disabled={!results}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {gantt.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Gantt Chart</h2>
                <div className="relative h-12 overflow-x-auto rounded-md bg-muted">
                  <div className="flex h-full" style={{ width: `${gantt[gantt.length - 1].end * 20}px` }}>
                    {gantt.map((block, i) => (
                      <div
                        key={i}
                        className={`flex h-full items-center justify-center border-r text-sm font-medium text-white ${getProcessColor(block.pid)}`}
                        style={{ width: `${(block.end - block.start) * 20}px` }}
                      >
                        {block.pid}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    {gantt.map((block, i) => (
                      <span key={i} style={{ paddingLeft: `${(block.end - block.start) * 20 - (i === gantt.length-1 ? 5 : 0)}px` }}>
                        {block.end}
                      </span>
                    ))}
                </div>
              </Card>
            )}

            {results && (
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Results</h2>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Process</th>
                          <th className="py-2 text-right">Waiting Time</th>
                          <th className="py-2 text-right">Turnaround Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processes.map((p) => (
                          <tr key={p.id} className="border-b">
                            <td className="py-2">{p.id}</td>
                            <td className="py-2 text-right">{results.waitingTimes[p.id]}</td>
                            <td className="py-2 text-right">{results.turnaroundTimes[p.id]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Waiting Time</div>
                      <div className="text-2xl font-bold text-primary">{results.avgWaiting}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Turnaround Time</div>
                      <div className="text-2xl font-bold text-primary">
                        {results.avgTurnaround}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RR;
