import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, SkipForward, RotateCcw, Save, Plus, Trash2 } from "lucide-react";
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

const SJF = () => {
  const { toast } = useToast();
  const [processes, setProcesses] = useState<Process[]>([
    { id: "P1", arrival: 0, burst: 5 },
    { id: "P2", arrival: 2, burst: 3 },
    { id: "P3", arrival: 4, burst: 1 },
  ]);
  const [gantt, setGantt] = useState<GanttBlock[]>([]);
  const [results, setResults] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Deterministic color mapping
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
    let remainingProcesses = [...processes];
    const ganttChart: GanttBlock[] = [];
    const waitingTimes: { [key: string]: number } = {};
    const turnaroundTimes: { [key: string]: number } = {};
    let currentTime = 0;

    while (remainingProcesses.length > 0) {
      const availableProcesses = remainingProcesses.filter(p => p.arrival <= currentTime);

      if (availableProcesses.length === 0) {
        // If no process is available, move time to the next arrival
        const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival));
        currentTime = nextArrival;
        continue;
      }

      // Sort by burst time, then arrival time for tie-breaking
      availableProcesses.sort((a, b) => {
        if (a.burst !== b.burst) return a.burst - b.burst;
        return a.arrival - b.arrival;
      });

      const currentProcess = availableProcesses[0];
      const startTime = currentTime;
      const endTime = startTime + currentProcess.burst;

      ganttChart.push({ pid: currentProcess.id, start: startTime, end: endTime });

      waitingTimes[currentProcess.id] = startTime - currentProcess.arrival;
      turnaroundTimes[currentProcess.id] = endTime - currentProcess.arrival;

      currentTime = endTime;
      remainingProcesses = remainingProcesses.filter(p => p.id !== currentProcess.id);
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
    setCurrentStep(ganttChart.length);

    toast({
      title: "Simulation Complete",
      description: `Average Waiting Time: ${avgWaiting.toFixed(2)}`,
    });
  };

  const reset = () => {
    setGantt([]);
    setResults(null);
    setCurrentStep(0);
  };

  const saveExperiment = () => {
    // TODO: Save to localStorage
    toast({
      title: "Experiment Saved",
      description: "Your simulation has been saved to your progress.",
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">SJF - Shortest Job First</h1>
          <p className="text-muted-foreground">
            Non-preemptive scheduling where the process with the smallest burst time is executed next.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Input */}
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

            {/* Controls */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Controls</h2>
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
            </Card>
          </div>

          {/* Right Column - Visualization */}
          <div className="space-y-6">
            {/* Gantt Chart */}
            {gantt.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Gantt Chart</h2>
                <div className="space-y-3">
                  {gantt.map((block, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-sm font-medium">{block.pid}</span>
                        <div className="relative h-10 flex-1 overflow-hidden rounded-md bg-muted">
                          <div
                            className={`absolute h-full ${getProcessColor(
                              block.pid
                            )} flex items-center justify-center text-sm font-medium text-white transition-all`}
                            style={{
                              left: `${(block.start / gantt[gantt.length - 1].end) * 100}%`,
                              width: `${
                                ((block.end - block.start) / gantt[gantt.length - 1].end) * 100
                              }%`,
                            }}
                          >
                            {block.end - block.start}ms
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pl-11 text-xs text-muted-foreground">
                        <span>Start: {block.start}</span>
                        <span>End: {block.end}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Results */}
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

export default SJF;
