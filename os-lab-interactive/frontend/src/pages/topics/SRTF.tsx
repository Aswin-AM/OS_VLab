import { Link } from "react-router-dom";
import "./SRTF.css";

const SRTF = () => {
  return (
    <div className="srtf-container">
      <h2>Shortest Remaining Time First (SRTF)</h2>
      <p>
        SRTF is the preemptive version of SJF. The process with the smallest
        remaining time is selected for execution. If a new process arrives
        with a shorter remaining time than the currently executing process,
        the current process is preempted.
      </p>
      <Link to="/visualizer/srtf">
        <button>Visualize SRTF</button>
      </Link>
    </div>
  );
};

export default SRTF;
