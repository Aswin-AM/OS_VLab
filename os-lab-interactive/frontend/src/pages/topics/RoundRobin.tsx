import { Link } from "react-router-dom";
import "./RoundRobin.css";

const RoundRobin = () => {
  return (
    <div className="round-robin-container">
      <h2>Round Robin (RR)</h2>
      <p>
        Round Robin is a preemptive scheduling algorithm. It assigns a fixed time
        unit, called a quantum, to each process. The ready queue is treated as a
        circular queue. The scheduler goes around the ready queue, allocating
        the CPU to each process for a time interval of one quantum. If the
        process is still running at the end of the quantum, it is preempted and
        added to the end of the ready queue.
      </p>
      <Link to="/visualizer/rr">
        <button>Visualize RR</button>
      </Link>
    </div>
  );
};

export default RoundRobin;