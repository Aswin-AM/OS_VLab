import { Link } from "react-router-dom";
import "./Priority.css";

const Priority = () => {
  return (
    <div className="priority-container">
      <h2>Priority Scheduling</h2>
      <p>
        Priority scheduling is a non-preemptive algorithm where each process is
        assigned a priority. The process with the highest priority is selected
        for execution. Processes with the same priority are executed in FCFS
        order.
      </p>
      <Link to="/visualizer/priority">
        <button>Visualize Priority Scheduling</button>
      </Link>
    </div>
  );
};

export default Priority;
