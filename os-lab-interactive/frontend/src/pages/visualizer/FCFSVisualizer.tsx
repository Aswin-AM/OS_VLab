import React, { useState } from "react";
import "./FCFSVisualizer.css";

interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
}

interface ScheduleEntry {
  process: Process;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
}

const FCFSVisualizer: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processName, setProcessName] = useState<string>("");
  const [arrivalTime, setArrivalTime] = useState<string>("");
  const [burstTime, setBurstTime] = useState<string>("");
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  const addProcess = () => {
    if (processName && arrivalTime && burstTime) {
      const newProcess: Process = {
        id: processes.length + 1,
        name: processName,
        arrivalTime: parseInt(arrivalTime),
        burstTime: parseInt(burstTime),
      };
      setProcesses([...processes, newProcess]);
      setProcessName("");
      setArrivalTime("");
      setBurstTime("");
    }
  };

  const calculateSchedule = () => {
    const sortedProcesses = [...processes].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    const newSchedule: ScheduleEntry[] = [];
    let currentTime = 0;

    sortedProcesses.forEach((process) => {
      const completionTime =
        Math.max(currentTime, process.arrivalTime) + process.burstTime;
      const turnaroundTime = completionTime - process.arrivalTime;
      const waitingTime = turnaroundTime - process.burstTime;

      newSchedule.push({
        process,
        completionTime,
        turnaroundTime,
        waitingTime,
      });

      currentTime = completionTime;
    });

    setSchedule(newSchedule);
  };

  return (
    <div className="fcfs-visualizer-container">
      <h2>FCFS Visualizer</h2>
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

      {schedule.length > 0 && (
        <div>
          <h3>FCFS Schedule</h3>
          <table>
            <thead>
              <tr>
                <th>Process</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Completion Time</th>
                <th>Turnaround Time</th>
                <th>Waiting Time</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((entry) => (
                <tr key={entry.process.id}>
                  <td>{entry.process.name}</td>
                  <td>{entry.process.arrivalTime}</td>
                  <td>{entry.process.burstTime}</td>
                  <td>{entry.completionTime}</td>
                  <td>{entry.turnaroundTime}</td>
                  <td>{entry.waitingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Gantt Chart</h3>
          <div className="gantt-chart">
            {schedule.map((entry) => (
              <div
                key={entry.process.id}
                className="gantt-bar"
                style={{ width: `${entry.process.burstTime * 20}px` }}
              >
                {entry.process.name}
                <div className="gantt-time">{entry.completionTime}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FCFSVisualizer;
