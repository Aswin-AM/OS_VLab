import { Link } from "react-router-dom";
import "./Topics.css";

const Topics = () => {
  return (
    <div className="topics-container">
      <h2>CPU Scheduling Algorithms</h2>
      <ul>
        <li>
          <Link to="/topics/fcfs">First-Come, First-Served (FCFS)</Link>
        </li>
        <li>
          <Link to="/topics/sjf">Shortest Job First (SJF)</Link>
        </li>
        <li>
          <Link to="/topics/srtf">Shortest Remaining Time First (SRTF)</Link>
        </li>
        <li>
          <Link to="/topics/priority">Priority Scheduling</Link>
        </li>
        <li>
          <Link to="/topics/priority-np">Priority (Non-Preemptive)</Link>
        </li>
        <li>
          <Link to="/topics/priority-p">Priority (Preemptive)</Link>
        </li>
        <li>
          <Link to="/topics/rr">Round Robin (RR)</Link>
        </li>
        <li>
          <Link to="/topics/multilevel-queue">Multilevel Queue</Link>
        </li>
        {/* Add more topics here */}
      </ul>
    </div>
  );
};

export default Topics;