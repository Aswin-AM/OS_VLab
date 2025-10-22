import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { 
  Cpu, Database, HardDrive, Lock, GitBranch, Layers,
  ArrowRight
} from "lucide-react";

const Topics = () => {
  const cpuAlgorithms = [
    { name: "FCFS", path: "/topics/cpu/fcfs", desc: "First Come First Serve" },
    { name: "SJF", path: "/topics/cpu/sjf", desc: "Shortest Job First" },
    { name: "SRTF", path: "/topics/cpu/srtf", desc: "Shortest Remaining Time First" },
    { name: "Priority (Non-Preemptive)", path: "/topics/cpu/priority-np", desc: "Priority-based" },
    { name: "Priority (Preemptive)", path: "/topics/cpu/priority-p", desc: "Preemptive Priority" },
    { name: "Round Robin", path: "/topics/cpu/rr", desc: "Time Quantum Based" },
    { name: "Multilevel Queue", path: "/topics/cpu/mlq", desc: "Multiple Queues" },
  ];

  const memoryAlgorithms = [
    { name: "First Fit", path: "/topics/memory/firstfit", desc: "First available block" },
    { name: "Best Fit", path: "/topics/memory/bestfit", desc: "Smallest sufficient block" },
    { name: "Worst Fit", path: "/topics/memory/worstfit", desc: "Largest available block" },
    { name: "FIFO", path: "/topics/memory/fifo", desc: "First In First Out" },
    { name: "LRU", path: "/topics/memory/lru", desc: "Least Recently Used" },
    { name: "Optimal", path: "/topics/memory/optimal", desc: "Optimal Page Replacement" },
  ];

  const diskAlgorithms = [
    { name: "FCFS", path: "/topics/disk/fcfs", desc: "First Come First Serve" },
    { name: "SSTF", path: "/topics/disk/sstf", desc: "Shortest Seek Time First" },
    { name: "SCAN", path: "/topics/disk/scan", desc: "Elevator Algorithm" },
    { name: "C-SCAN", path: "/topics/disk/cscan", desc: "Circular SCAN" },
    { name: "LOOK", path: "/topics/disk/look", desc: "SCAN variation" },
    { name: "C-LOOK", path: "/topics/disk/clook", desc: "Circular LOOK" },
  ];

  const syncTopics = [
    { name: "Semaphores", path: "/topics/sync/semaphore", desc: "Producer-Consumer Problem" },
    { name: "Banker's Algorithm", path: "/topics/sync/bankers", desc: "Deadlock Avoidance" },
    { name: "Deadlock Detection", path: "/topics/sync/deadlock", desc: "Resource Allocation Graph" },
  ];

  const processTopics = [
    { name: "Fork & Exec", path: "/topics/process/fork-exec", desc: "Process Creation" },
    { name: "Process States", path: "/topics/process/states", desc: "Zombie & Orphan Processes" },
  ];

  const threadTopics = [
    { name: "Thread Creation", path: "/topics/threads/creation", desc: "Thread Lifecycle" },
    { name: "Race Conditions", path: "/topics/threads/race", desc: "Concurrency Issues" },
    { name: "Mutex & Locks", path: "/topics/threads/mutex", desc: "Mutual Exclusion" },
    { name: "Dining Philosophers", path: "/topics/threads/philosophers", desc: "Classic Sync Problem" },
  ];

  const TopicSection = ({ 
    title, 
    icon: Icon, 
    algorithms, 
    color 
  }: { 
    title: string; 
    icon: any; 
    algorithms: any[]; 
    color: string;
  }) => (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {algorithms.map((algo, i) => (
          <Link key={i} to={algo.path} className="block p-4 border rounded-lg hover:border-primary/50 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold group-hover:text-primary transition-colors">
                  {algo.name}
                </div>
                <div className="text-xs text-muted-foreground">{algo.desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">All Topics</h1>
          <p className="text-lg text-muted-foreground">
            Choose an algorithm to start your interactive learning session
          </p>
        </div>

        <div className="space-y-8">
          <TopicSection 
            title="CPU Scheduling" 
            icon={Cpu} 
            algorithms={cpuAlgorithms}
            color="bg-blue-500"
          />
          
          <TopicSection 
            title="Memory Management" 
            icon={Database} 
            algorithms={memoryAlgorithms}
            color="bg-green-500"
          />
          
          <TopicSection 
            title="Disk Scheduling" 
            icon={HardDrive} 
            algorithms={diskAlgorithms}
            color="bg-purple-500"
          />
          
          <TopicSection 
            title="Synchronization" 
            icon={Lock} 
            algorithms={syncTopics}
            color="bg-amber-500"
          />
          
          <TopicSection 
            title="Process Management" 
            icon={GitBranch} 
            algorithms={processTopics}
            color="bg-pink-500"
          />
          
          <TopicSection 
            title="Threads" 
            icon={Layers} 
            algorithms={threadTopics}
            color="bg-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Topics;
