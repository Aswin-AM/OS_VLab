import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div>
      <section className="hero">
        <h1>Welcome to the CPU Scheduling Visualizer</h1>
        <p>
          Learn and visualize common CPU scheduling algorithms in a fun and
          interactive way.
        </p>
        <Link to="/topics">
          <button>Get Started</button>
        </Link>
      </section>
      <section className="introduction">
        <h2>About the Project</h2>
        <p>
          This project is designed to help computer science students and
          enthusiasts understand the fundamentals of CPU scheduling. You can
          choose from a variety of algorithms, input your own processes, and
          see how the scheduler handles them in real-time.
        </p>
      </section>
    </div>
  );
};

export default Home;