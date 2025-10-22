import React, { useState } from "react";
import "./RoundRobinVisualizer.css";

interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
}

interface GanttChartEntry {
  processName: string;
  start: number;
  end: number;
}

const RoundRobinVisualizer: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processName, setProcessName] = useState<string>("");
  const [arrivalTime, setArrivalTime] = useState<string>("");
  const [burstTime, setBurstTime] = useState<string>("");
  const [timeQuantum, setTimeQuantum] = useState<string>("");
  const [ganttChart, setGanttChart] = useState<GanttChartEntry[]>([]);

  const addProcess = () => {
    if (processName && arrivalTime && burstTime) {
      const newProcess: Process = {
        id: processes.length + 1,
        name: processName,
        arrivalTime: parseInt(arrivalTime),
        burstTime: parseInt(burstTime),
        remainingTime: parseInt(burstTime),
      };
      setProcesses([...processes, newProcess]);
      setProcessName("");
      setArrivalTime("");
      setBurstTime("");
    }
  };

  const calculateSchedule = () => {
    const readyQueue: Process[] = [];
    const newGanttChart: GanttChartEntry[] = [];
    let currentTime = 0;
    let processIndex = 0;

    const sortedProcesses = [...processes].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );

    while (processIndex < sortedProcesses.length || readyQueue.length > 0) {
      while (
        processIndex < sortedProcesses.length &&
        sortedProcesses[processIndex].arrivalTime <= currentTime
      ) {
        readyQueue.push(sortedProcesses[processIndex]);
        processIndex++;
      }

      if (readyQueue.length > 0) {
        const currentProcess = readyQueue.shift()!;
        const executionTime = Math.min(
          currentProcess.remainingTime,
          parseInt(timeQuantum)
        );

        newGanttChart.push({
          processName: currentProcess.name,
          start: currentTime,
          end: currentTime + executionTime,
        });

        currentProcess.remainingTime -= executionTime;
        currentTime += executionTime;

        while (
          processIndex < sortedProcesses.length &&
          sortedProcesses[processIndex].arrivalTime <= currentTime
        ) {
          readyQueue.push(sortedProcesses[processIndex]);
          processIndex++;
        }

        if (currentProcess.remainingTime > 0) {
          readyQueue.push(currentProcess);
        }
      } else if (processIndex < sortedProcesses.length) {
        currentTime = sortedProcesses[processIndex].arrivalTime;
      }
    }

    setGanttChart(newGanttChart);
  };

  return (
    <div className="rr-visualizer-container">
      <h2>Round Robin Visualizer</h2>
      <div className="input-form">
        <h3>Add Process</h3>
        <input
          type="text"
          placeholder="Process Name"
          value={processName}
          onChange={(e) => setProcessName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Arrival Time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
        />
        <input
          type="number"
          placeholder="Burst Time"
          value={burstTime}
          onChange={(e) => setBurstTime(e.target.value)}
        />
        <button onClick={addProcess}>Add Process</button>
      </div>

      <div className="input-form">
        <h3>Time Quantum</h3>
        <input
          type="number"
          placeholder="Time Quantum"
          value={timeQuantum}
          onChange={(e) => setTimeQuantum(e.target.value)}
        />
      </div>

      <h3>Processes</h3>
      <table>
        <thead>
          <tr>
            <th>Process</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.arrivalTime}</td>
              <td>{p.burstTime}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={calculateSchedule}>Calculate Schedule</button>

      {ganttChart.length > 0 && (
        <div>
          <h3>Gantt Chart</h3>
          <div className="gantt-chart">
            {ganttChart.map((entry, index) => (
              <div
                key={index}
                className="gantt-bar"
                style={{ width: `${(entry.end - entry.start) * 20}px` }}
              >
                {entry.processName}
                <div className="gantt-time">{entry.end}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundRobinVisualizer;       
