import { Link } from "react-router-dom";
import "./Priority.css";

const PriorityNP = () => {
  return (
    <div className="priority-container">
      <h2>Priority Scheduling (Non-Preemptive)</h2>
      <p>
        In non-preemptive priority scheduling, the process with the highest priority is selected
        for execution. Once a process starts executing, it runs to completion, even if a
        higher priority process arrives.
      </p>
      <Link to="/visualizer/priority-np">
        <button>Visualize Non-Preemptive Priority</button>
      </Link>
    </div>
  );
};

export default PriorityNP;
