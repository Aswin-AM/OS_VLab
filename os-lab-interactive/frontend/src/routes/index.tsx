import App from "../App";
import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Docs from "../pages/Docs";
import ReportBug from "../pages/ReportBug";
import Topics from "../pages/Topics";
import Progress from "../pages/Progress";
import NotFound from "../pages/NotFound";
import FCFS from "../pages/topics/FCFS";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Profile from "../pages/Profile";
import RoundRobin from "../pages/topics/RoundRobin";
import FCFSVisualizer from "../pages/visualizer/FCFSVisualizer";
import RoundRobinVisualizer from "../pages/visualizer/RoundRobinVisualizer";
import SJFVisualizer from "../pages/visualizer/SJFVisualizer";
import SJF from "../pages/topics/SJF";
import SRTFVisualizer from "../pages/visualizer/SRTFVisualizer";
import SRTF from "../pages/topics/SRTF";
import PriorityVisualizer from "../pages/visualizer/PriorityVisualizer";
import Priority from "../pages/topics/Priority";
import PriorityNP from "../pages/topics/PriorityNP";
import PriorityNPVisualizer from "../pages/visualizer/PriorityNPVisualizer";
import PriorityP from "../pages/topics/PriorityP";
import PriorityPVisualizer from "../pages/visualizer/PriorityPVisualizer";
import MultilevelQueue from "../pages/topics/MultilevelQueue";
import MultilevelQueueVisualizer from "../pages/visualizer/MultilevelQueueVisualizer";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/docs",
        element: <Docs />,
      },
      {
        path: "/report-bug",
        element: <ReportBug />,
      },
      {
        path: "/topics",
        element: <Topics />,
      },
      {
        path: "/topics/fcfs",
        element: <FCFS />,
      },
      {
        path: "/topics/rr",
        element: <RoundRobin />,
      },
      {
        path: "/topics/sjf",
        element: <SJF />,
      },
       {
        path: "/topics/srtf",
        element: <SRTF />,
      },
      {
        path: "/topics/priority",
        element: <Priority />,
      },
      {
        path: "/topics/priority-np",
        element: <PriorityNP />,
      },
      {
        path: "/topics/priority-p",
        element: <PriorityP />,
      },
      {
        path: "/topics/multilevel-queue",
        element: <MultilevelQueue />,
      },
      {
        path: "/visualizer/fcfs",
        element: <FCFSVisualizer />,
      },
      {
        path: "/visualizer/rr",
        element: <RoundRobinVisualizer />,
      },
      {
        path: "/visualizer/sjf",
        element: <SJFVisualizer />,
      },
      {
        path: "/visualizer/srtf",
        element: <SRTFVisualizer />,
      },
      {
        path: "/visualizer/priority",
        element: <PriorityVisualizer />,
      },
      {
        path: "/visualizer/priority-np",
        element: <PriorityNPVisualizer />,
      },
      {
        path: "/visualizer/priority-p",
        element: <PriorityPVisualizer />,
      },
      {
        path: "/visualizer/multilevel-queue",
        element: <MultilevelQueueVisualizer />,
      },
      {
        path: "/progress",
        element: <Progress />,
      },
      {
        path: "/auth/login",
        element: <Login />,
      },
      {
        path: "/auth/signup",
        element: <Signup />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ]
  },
]);