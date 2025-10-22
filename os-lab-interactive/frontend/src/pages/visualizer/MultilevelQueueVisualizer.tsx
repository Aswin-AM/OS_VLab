import React, { useState } from 'react';
import './PriorityVisualizer.css';

interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number; // This will be the queue number
  remainingTime: number;
}

interface GanttChartEntry {
  processName: string;
  start: number;
  end: number;
}

const MultilevelQueueVisualizer: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processName, setProcessName] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [burstTime, setBurstTime] = useState('');
  const [priority, setPriority] = useState(''); // Queue number
  const [ganttChart, setGanttChart] = useState<GanttChartEntry[]>([]);
  const [timeQuantum, setTimeQuantum] = useState('2');

  const addProcess = () => {
    if (processName && arrivalTime && burstTime && priority) {
      const newProcess: Process = {
        id: processes.length + 1,
        name: processName,
        arrivalTime: parseInt(arrivalTime),
        burstTime: parseInt(burstTime),
        priority: parseInt(priority),
        remainingTime: parseInt(burstTime),
      };
      setProcesses([...processes, newProcess]);
      setProcessName('');
      setArrivalTime('');
      setBurstTime('');
      setPriority('');
    }
  };

  const calculateMultilevelQueue = () => {
    let localProcesses = JSON.parse(JSON.stringify(processes));
    const newGanttChart: GanttChartEntry[] = [];
    let currentTime = 0;
    const executedProcesses = new Set();

    const queues: Process[][] = [];
    localProcesses.forEach(p => {
      if (!queues[p.priority]) {
        queues[p.priority] = [];
      }
      queues[p.priority].push(p);
    });

    while (executedProcesses.size < localProcesses.length) {
      let processExecutedInCycle = false;
      for (let i = 0; i < queues.length; i++) {
        if (queues[i]) {
          const availableProcesses = queues[i]
            .filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0)
            .sort((a,b) => a.arrivalTime - b.arrivalTime);

          if (availableProcesses.length > 0) {
            const processToExecute = availableProcesses[0];
            const startTime = currentTime;
            const executionTime = Math.min(processToExecute.remainingTime, parseInt(timeQuantum));
            const endTime = startTime + executionTime;

            let currentGanttProcess = newGanttChart[newGanttChart.length - 1];

            if (newGanttChart.length > 0 && currentGanttProcess.processName === processToExecute.name) {
              currentGanttProcess.end = endTime;
            } else {
              newGanttChart.push({
                processName: processToExecute.name,
                start: startTime,
                end: endTime,
              });
            }
            
            processToExecute.remainingTime -= executionTime;
            currentTime = endTime;

            if (processToExecute.remainingTime === 0) {
              executedProcesses.add(processToExecute.id);
            }
            processExecutedInCycle = true;
            break; // Move to next cycle after one process is executed
          }
        }
      }
      if (!processExecutedInCycle) {
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
    <div className="priority-visualizer-container">
      <h2>Multilevel Queue Visualizer</h2>
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
          placeholder="Queue Number"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        />
        <button onClick={addProcess}>Add Process</button>
      </div>

      <div className="input-form">
        <h3>Settings</h3>
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
            <th>Queue</th>
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

      <button onClick={calculateMultilevelQueue}>Calculate Multilevel Queue Schedule</button>

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

export default MultilevelQueueVisualizer;
