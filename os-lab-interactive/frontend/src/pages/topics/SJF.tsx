import { Link } from "react-router-dom";
import "./SJF.css";

const SJF = () => {
  return (
    <div className="sjf-container">
      <h2>Shortest Job First (SJF)</h2>
      <p>
        SJF is a scheduling algorithm in which the process with the smallest
        execution time is selected for execution next. It can be either
        preemptive or non-preemptive. This visualizer implements the
        non-preemptive version.
      </p>
      <Link to="/visualizer/sjf">
        <button>Visualize SJF</button>
      </Link>
    </div>
  );
};

export default SJF;
