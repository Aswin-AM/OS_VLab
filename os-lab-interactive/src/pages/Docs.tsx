import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Docs = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive guides for all operating system concepts and algorithms
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cpu">CPU</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="disk">Disk</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Welcome to OS VLab</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground">
                  OS VLab is an interactive virtual laboratory for learning operating system concepts.
                  Each module provides hands-on simulation with step-by-step visualization.
                </p>

                <h3 className="mt-6 text-xl font-semibold">Features</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Interactive input tables with validation</li>
                  <li>✓ Step-by-step execution with visual feedback</li>
                  <li>✓ Gantt charts and performance metrics</li>
                  <li>✓ Save and load experiments</li>
                  <li>✓ Comprehensive documentation</li>
                </ul>

                <h3 className="mt-6 text-xl font-semibold">How to Use</h3>
                <ol className="space-y-2 text-muted-foreground">
                  <li>1. Select a topic from the Topics page</li>
                  <li>2. Enter or edit process data in the input table</li>
                  <li>3. Click "Run Simulation" to see results</li>
                  <li>4. Use step controls to advance through execution</li>
                  <li>5. Save your experiments to track progress</li>
                </ol>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cpu">
            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold">CPU Scheduling</h2>
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-semibold">FCFS (First Come First Serve)</h3>
                <p className="text-muted-foreground">
                  Non-preemptive algorithm where processes are executed in the order they arrive.
                  Simple but can lead to convoy effect.
                </p>

                <h4 className="mt-4 font-semibold">Key Metrics</h4>
                <ul className="text-muted-foreground">
                  <li><strong>Waiting Time:</strong> Time spent in ready queue</li>
                  <li><strong>Turnaround Time:</strong> Completion time - Arrival time</li>
                  <li><strong>Response Time:</strong> Time to first execution</li>
                </ul>

                <h3 className="mt-6 text-xl font-semibold">Round Robin</h3>
                <p className="text-muted-foreground">
                  Preemptive algorithm with fixed time quantum. Each process gets CPU for a time slice,
                  then moves to back of queue if not finished.
                </p>

                <h3 className="mt-6 text-xl font-semibold">Priority Scheduling</h3>
                <p className="text-muted-foreground">
                  Processes are scheduled based on priority. Can be preemptive or non-preemptive.
                  Lower priority number = higher priority.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="memory">
            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Memory Management</h2>
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-semibold">Contiguous Allocation</h3>
                <ul className="text-muted-foreground">
                  <li><strong>First Fit:</strong> Allocate first hole large enough</li>
                  <li><strong>Best Fit:</strong> Allocate smallest sufficient hole</li>
                  <li><strong>Worst Fit:</strong> Allocate largest hole</li>
                </ul>

                <h3 className="mt-6 text-xl font-semibold">Page Replacement</h3>
                <ul className="text-muted-foreground">
                  <li><strong>FIFO:</strong> Replace oldest page</li>
                  <li><strong>LRU:</strong> Replace least recently used page</li>
                  <li><strong>Optimal:</strong> Replace page not needed for longest time (theoretical)</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="disk">
            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Disk Scheduling</h2>
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-semibold">Algorithms</h3>
                <ul className="text-muted-foreground">
                  <li><strong>FCFS:</strong> Service requests in arrival order</li>
                  <li><strong>SSTF:</strong> Service closest request first</li>
                  <li><strong>SCAN:</strong> Move head in one direction, service all requests</li>
                  <li><strong>C-SCAN:</strong> Like SCAN but only in one direction</li>
                  <li><strong>LOOK/C-LOOK:</strong> Like SCAN but only goes to last request</li>
                </ul>

                <h3 className="mt-6 text-xl font-semibold">Performance Metric</h3>
                <p className="text-muted-foreground">
                  <strong>Total Seek Time:</strong> Sum of all head movements in cylinders
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Docs;
