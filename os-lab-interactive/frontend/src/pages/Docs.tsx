
import React from 'react';
import './Docs.css';

const Docs: React.FC = () => {
  return (
    <div className="docs-container">
      <h1>Operating Systems Concepts</h1>

      <div className="section">
        <h2>CPU Scheduling</h2>
        <div className="topic">
          <h3>FCFS (First Come First Serve)</h3>
          <p>Processes are executed in the order they arrive.</p>
        </div>
        <div className="topic">
          <h3>SJF (Shortest Job First)</h3>
          <p>The process with the smallest execution time is executed next.</p>
        </div>
        <div className="topic">
          <h3>SRTF (Shortest Remaining Time First)</h3>
          <p>Preemptive version of SJF; if a new process arrives with a shorter remaining time, the current process is paused.</p>
        </div>
        <div className="topic">
          <h3>Priority (Non-Preemptive)</h3>
          <p>Processes are assigned priorities, and the highest priority process is executed next.</p>
        </div>
        <div className="topic">
          <h3>Priority (Preemptive)</h3>
          <p>Similar to non-preemptive priority, but can be interrupted by a higher priority process.</p>
        </div>
        <div className="topic">
          <h3>Round Robin</h3>
          <p>Each process is given a fixed time slot (quantum) to execute.</p>
        </div>
        <div className="topic">
          <h3>Multilevel Queue</h3>
          <p>Processes are permanently assigned to a queue based on some property (e.g., memory size, priority).</p>
        </div>
      </div>

      <div className="section">
        <h2>Memory Management</h2>
        <div className="topic">
          <h3>First Fit</h3>
          <p>The first hole that is big enough is allocated to the process.</p>
        </div>
        <div className="topic">
          <h3>Best Fit</h3>
          <p>The smallest hole that is big enough is allocated to the process.</p>
        </div>
        <div className="topic">
          <h3>Worst Fit</h3>
          <p>The largest hole is allocated to the process.</p>
        </div>
        <div className="topic">
          <h3>FIFO (First In First Out)</h3>
          <p>Page replacement algorithm where the oldest page in memory is replaced.</p>
        </div>
        <div className="topic">
          <h3>LRU (Least Recently Used)</h3>
          <p>Page replacement algorithm where the least recently used page is replaced.</p>
        </div>
        <div className="topic">
          <h3>Optimal</h3>
          <p>Page replacement algorithm that replaces the page that will not be used for the longest period of time.</p>
        </div>
      </div>

      <div className="section">
        <h2>Disk Scheduling</h2>
        <div className="topic">
          <h3>FCFS (First Come First Serve)</h3>
          <p>Disk requests are serviced in the order they arrive.</p>
        </div>
        <div className="topic">
          <h3>SSTF (Shortest Seek Time First)</h3>
          <p>The request with the minimum seek time from the current head position is serviced next.</p>
        </div>
        <div className="topic">
          <h3>SCAN (Elevator Algorithm)</h3>
          <p>The disk arm moves from one end of the disk to the other, servicing requests along the way.</p>
        </div>
        <div className="topic">
          <h3>C-SCAN (Circular SCAN)</h3>
          <p>Like SCAN, but when the arm reaches the end, it immediately returns to the beginning without servicing any requests on the return trip.</p>
        </div>
        <div className="topic">
          <h3>LOOK</h3>
          <p>A variation of SCAN where the arm only travels as far as the last request in each direction.</p>
        </div>
        <div className="topic">
          <h3>C-LOOK (Circular LOOK)</h3>
          <p>A variation of C-SCAN where the arm only travels as far as the last request in each direction.</p>
        </div>
      </div>

      <div className="section">
        <h2>Synchronization</h2>
        <div className="topic">
          <h3>Semaphores</h3>
          <p>A synchronization tool used to solve the producer-consumer problem and other critical section problems.</p>
        </div>
        <div className="topic">
          <h3>Banker's Algorithm</h3>
          <p>A deadlock avoidance algorithm that checks for a safe state before granting a resource request.</p>
        </div>
        <div className="topic">
          <h3>Deadlock Detection</h3>
          <p>Algorithms that determine if a deadlock has occurred, often using a Resource Allocation Graph.</p>
        </div>
      </div>

      <div className="section">
        <h2>Process Management</h2>
        <div className="topic">
          <h3>Fork & Exec</h3>
          <p>System calls used in Unix-like operating systems for process creation.</p>
        </div>
        <div className="topic">
          <h3>Process States (Zombie & Orphan)</h3>
          <p>A zombie process has completed execution but still has an entry in the process table. An orphan process is a running process whose parent has terminated.</p>
        </div>
      </div>

      <div className="section">
        <h2>Threads</h2>
        <div className="topic">
          <h3>Thread Creation & Lifecycle</h3>
          <p>The process of creating a new thread and the states it goes through (new, runnable, blocked, terminated).</p>
        </div>
        <div className="topic">
          <h3>Race Conditions</h3>
          <p>A concurrency issue that occurs when the outcome of a computation depends on the unpredictable timing of events.</p>
        </div>
        <div className="topic">
          <h3>Mutex & Locks</h3>
          <p>Mechanisms for enforcing mutual exclusion to prevent race conditions.</p>
        </div>
        <div className="topic">
          <h3>Dining Philosophers</h3>
          <p>A classic synchronization problem illustrating the challenges of deadlock and starvation.</p>
        </div>
      </div>
    </div>
  );
};

export default Docs;
