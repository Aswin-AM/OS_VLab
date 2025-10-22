import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Cpu, HardDrive, Database, Lock, GitBranch, Layers } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Cpu,
      title: "CPU Scheduling",
      description: "FCFS, SJF, SRTF, Priority, Round Robin, Multilevel Queue",
      link: "/topics/cpu",
    },
    {
      icon: Database,
      title: "Memory Management",
      description: "First Fit, Best Fit, Worst Fit, FIFO, LRU, Optimal",
      link: "/topics/memory",
    },
    {
      icon: HardDrive,
      title: "Disk Scheduling",
      description: "FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK",
      link: "/topics/disk",
    },
    {
      icon: Lock,
      title: "Synchronization",
      description: "Semaphores, Banker's Algorithm, Deadlock Detection",
      link: "/topics/sync",
    },
    {
      icon: GitBranch,
      title: "Process Management",
      description: "Fork, Exec, Process States, Zombie, Orphan",
      link: "/topics/process",
    },
    {
      icon: Layers,
      title: "Threads",
      description: "Thread Creation, Race Conditions, Mutex, Dining Philosophers",
      link: "/topics/threads",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-transparent py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Master Operating Systems
              <span className="block text-primary">Through Interactive Visualization</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              A complete virtual lab for learning OS concepts: CPU scheduling, memory management, 
              disk scheduling, process synchronization, and more. All with step-by-step visualization.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/topics">
                <Button size="lg" className="group">
                  Explore Topics
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline">
                  Read Documentation
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Features Highlight */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-4 md:grid-cols-3">
            {[
              {
                title: "Step-by-Step",
                desc: "Watch algorithms execute with detailed step animations",
              },
              {
                title: "Visual Charts",
                desc: "Beautiful Gantt charts and performance metrics",
              },
              {
                title: "Save Progress",
                desc: "Track your learning journey and experiments",
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 text-center">
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Comprehensive OS Curriculum
            </h2>
            <p className="text-lg text-muted-foreground">
              Six major modules covering all fundamental operating system concepts
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Link key={i} to={feature.link}>
                <Card className="group h-full p-6 transition-all hover:shadow-lg hover:border-primary/50">
                  <feature.icon className="mb-4 h-10 w-10 text-primary" />
                  <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary">
                    Explore
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Start Learning Today
            </h2>
            <p className="mb-6 text-muted-foreground">
              Interactive simulations with step-by-step execution, complete documentation, 
              and progress tracking to help you master operating systems.
            </p>
            <Link to="/topics">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
