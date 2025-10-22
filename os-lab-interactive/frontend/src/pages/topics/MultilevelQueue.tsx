import { Link } from "react-router-dom";
import "./Priority.css";

const MultilevelQueue = () => {
  return (
    <div className="priority-container">
      <h2>Multilevel Queue Scheduling</h2>
      <p>
        Multilevel queue scheduling divides the ready queue into several separate queues.
        Processes are permanently assigned to one queue, generally based on some property of
        the process, such as memory size, process priority, or process type.
      </p>
      <Link to="/visualizer/multilevel-queue">
        <button>Visualize Multilevel Queue</button>
      </Link>
    </div>
  );
};

export default MultilevelQueue;
