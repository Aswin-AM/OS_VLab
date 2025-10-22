import React, { useState } from 'react';
import './SRTFVisualizer.css';

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

const SRTFVisualizer: React.FC = () => {
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
        remainingTime: parseInt(burstTime),
      };
      setProcesses([...processes, newProcess]);
      setProcessName('');
      setArrivalTime('');
      setBurstTime('');
    }
  };

  const calculateSRTF = () => {
    let localProcesses = processes.map(p => ({ ...p })); // Deep copy
    const newGanttChart: GanttChartEntry[] = [];
    let currentTime = 0;
    let completed = 0;

    while (completed < localProcesses.length) {
      const availableProcesses = localProcesses.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

      if (availableProcesses.length > 0) {
        availableProcesses.sort((a, b) => a.remainingTime - b.remainingTime);
        const processToExecute = availableProcesses[0];
        const processIndex = localProcesses.findIndex(p => p.id === processToExecute.id);

        const startTime = currentTime;
        currentTime++;
        localProcesses[processIndex].remainingTime--;

        if (newGanttChart.length > 0 && newGanttChart[newGanttChart.length - 1].processName === processToExecute.name) {
          newGanttChart[newGanttChart.length - 1].end = currentTime;
        } else {
          newGanttChart.push({ processName: processToExecute.name, start: startTime, end: currentTime });
        }

        if (localProcesses[processIndex].remainingTime === 0) {
          completed++;
        }
      } else {
        const nextArrivalTime = Math.min(...localProcesses.filter(p => p.remainingTime > 0).map(p => p.arrivalTime));
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
    <div className="srtf-visualizer-container">
      <h2>SRTF Visualizer</h2>
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

      <button onClick={calculateSRTF}>Calculate SRTF Schedule</button>

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

export default SRTFVisualizer;
