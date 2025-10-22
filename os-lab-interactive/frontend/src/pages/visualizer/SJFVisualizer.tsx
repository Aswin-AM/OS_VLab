import React, { useState } from 'react';
import './SJFVisualizer.css';

interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
}

interface GanttChartEntry {
  processName: string;
  start: number;
  end: number;
}

const SJFVisualizer: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processName, setProcessName] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [burstTime, setBurstTime] = useState('');
  const [ganttChart, setGanttChart] = useState<GanttChartEntry[]>([]);

  const addProcess = () => {
    if (processName && arrivalTime && burstTime) {
      const newProcess: Process = {
        id: processes.length + 1,
        name: processName,
        arrivalTime: parseInt(arrivalTime),
        burstTime: parseInt(burstTime),
      };
      setProcesses([...processes, newProcess]);
      setProcessName('');
      setArrivalTime('');
      setBurstTime('');
    }
  };

  const calculateSJF = () => {
    let localProcesses = [...processes];
    const newGanttChart: GanttChartEntry[] = [];
    let currentTime = 0;
    const executedProcesses = new Set();

    while (executedProcesses.size < localProcesses.length) {
      const availableProcesses = localProcesses
        .filter(p => p.arrivalTime <= currentTime && !executedProcesses.has(p.id))
        .sort((a, b) => a.burstTime - b.burstTime);

      if (availableProcesses.length > 0) {
        const processToExecute = availableProcesses[0];
        const startTime = currentTime;
        const endTime = startTime + processToExecute.burstTime;

        newGanttChart.push({
          processName: processToExecute.name,
          start: startTime,
          end: endTime,
        });

        currentTime = endTime;
        executedProcesses.add(processToExecute.id);
      } else {
        const nextArrivalTime = Math.min(...localProcesses.filter(p => !executedProcesses.has(p.id)).map(p => p.arrivalTime));
        if(isFinite(nextArrivalTime)){
          currentTime = nextArrivalTime;
        } else {
          break; // No more processes to execute
        }
      }
    }

    setGanttChart(newGanttChart);
  };

  return (
    <div className="sjf-visualizer-container">
      <h2>SJF Visualizer</h2>
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

      <button onClick={calculateSJF}>Calculate SJF Schedule</button>

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

export default SJFVisualizer;
