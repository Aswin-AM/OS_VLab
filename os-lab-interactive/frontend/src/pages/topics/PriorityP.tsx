import { Link } from "react-router-dom";
import "./Priority.css";

const PriorityP = () => {
  return (
    <div className="priority-container">
      <h2>Priority Scheduling (Preemptive)</h2>
      <p>
        In preemptive priority scheduling, the process with the highest priority is selected
        for execution. If a new process arrives with a higher priority than the currently
        running process, the current process is preempted and the new process is executed.
      </p>
      <Link to="/visualizer/priority-p">
        <button>Visualize Preemptive Priority</button>
      </Link>
    </div>
  );
};

export default PriorityP;
