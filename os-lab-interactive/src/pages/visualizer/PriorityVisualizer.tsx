import React, { useState } from 'react';
import './PriorityVisualizer.css';

interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
}

interface GanttChartEntry {
  processName: string;
  start: number;
  end: number;
}

const PriorityVisualizer: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processName, setProcessName] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [burstTime, setBurstTime] = useState('');
  const [priority, setPriority] = useState('');
  const [ganttChart, setGanttChart] = useState<GanttChartEntry[]>([]);

  const addProcess = () => {
    if (processName && arrivalTime && burstTime && priority) {
      const newProcess: Process = {
        id: processes.length + 1,
        name: processName,
        arrivalTime: parseInt(arrivalTime),
        burstTime: parseInt(burstTime),
        priority: parseInt(priority),
      };
      setProcesses([...processes, newProcess]);
      setProcessName('');
      setArrivalTime('');
      setBurstTime('');
      setPriority('');
    }
  };

  const calculatePriority = () => {
    const localProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const newGanttChart: GanttChartEntry[] = [];
    let currentTime = 0;
    const executedProcesses: number[] = [];

    while (executedProcesses.length < localProcesses.length) {
        let availableProcesses = localProcesses.filter(p => p.arrivalTime <= currentTime && !executedProcesses.includes(p.id));

        if (availableProcesses.length > 0) {
            availableProcesses.sort((a, b) => a.priority - b.priority); // Lower number indicates higher priority
            const processToExecute = availableProcesses[0];
            const processIndex = localProcesses.findIndex(p => p.id === processToExecute.id);

            const startTime = currentTime;
            currentTime += processToExecute.burstTime;
            newGanttChart.push({ processName: processToExecute.name, start: startTime, end: currentTime });
            executedProcesses.push(processToExecute.id);
        } else {
            const nextArrivalTime = Math.min(...localProcesses.filter(p => !executedProcesses.includes(p.id)).map(p => p.arrivalTime));
            if(isFinite(nextArrivalTime)){
                currentTime = nextArrivalTime;
            } else {
                break; 
            }
        }
    }

    setGanttChart(newGanttChart);
  };

  return (
    <div className="priority-visualizer-container">
      <h2>Priority Scheduling Visualizer</h2>
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
        <input
          type="number"
          placeholder="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
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
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.arrivalTime}</td>
              <td>{p.burstTime}</td>
              <td>{p.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={calculatePriority}>Calculate Priority Schedule</button>

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

export default PriorityVisualizer;
