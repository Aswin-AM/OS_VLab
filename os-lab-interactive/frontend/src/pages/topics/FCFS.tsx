import { Link } from "react-router-dom";
import "./FCFS.css";

const FCFS = () => {
  return (
    <div className="fcfs-container">
      <h2>First-Come, First-Served (FCFS)</h2>
      <p>
        FCFS is the simplest scheduling algorithm. Processes are dispatched
        according to their arrival time on the ready queue. It is a
        non-preemptive algorithm, meaning that once a process starts executing,
        it continues until it finishes or gets blocked.
      </p>
      <Link to="/visualizer/fcfs">
        <button>Visualize FCFS</button>
      </Link>
    </div>
  );
};

export default FCFS;