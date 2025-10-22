// Define the Event and State types locally as '../types' module is not found.
// These types are based on the usage within this file and the provided task description.

type Event = {
  tick: number;
  type: string;
  payload: any;
};

// Base State type
type State = {
  tick: number;
  // Other common state properties can be added here if needed
};

// Define the input structure for this algorithm
type PriorityNonPreemptiveInputProcess = {
  pid: number;
  arrivalTime: number;
  burstTime: number;
  priority: number;
};

// Define the state for this algorithm
type PriorityNonPreemptiveState = State & {
  processes: (PriorityNonPreemptiveInputProcess & { remainingTime: number })[]; // Processes yet to arrive
  readyQueue: (PriorityNonPreemptiveInputProcess & { remainingTime: number })[]; // Processes ready to run
  runningProcess: (PriorityNonPreemptiveInputProcess & { remainingTime: number }) | null; // Currently running process
  completedProcesses: (PriorityNonPreemptiveInputProcess & { remainingTime: number; completionTime: number })[]; // Processes that have finished
  currentTime: number;
  params: PriorityNonPreemptiveParams;
};

// Define parameters for this algorithm
type PriorityNonPreemptiveParams = {
  tieBreak: "arrival" | "priorityHighFirst";
  // No 'preempt' parameter as it's non-preemptive
};

// Helper function to sort the ready queue based on priority and tie-breaking rules
function sortReadyQueue(
  queue: (PriorityNonPreemptiveInputProcess & { remainingTime: number })[],
  params: PriorityNonPreemptiveParams
): (PriorityNonPreemptiveInputProcess & { remainingTime: number })[] {
  return [...queue].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority; // Lower number = higher priority
    }
    // Tie-breaking
    if (params.tieBreak === "arrival") {
      return a.arrivalTime - b.arrivalTime;
    } else { // "priorityHighFirst" is redundant here as priority is already equal
      // If priorities are equal and tieBreak is not arrival, we might need another rule or just keep original order
      // For now, let's assume arrival is the only other meaningful tie-breaker.
      // If we need to distinguish between two processes with same priority and arrival, we might use pid.
      return a.pid - b.pid; // Fallback to PID for absolute determinism
    }
  });
}

// Initialize the state
export function init(
  params: PriorityNonPreemptiveParams,
  input: PriorityNonPreemptiveInputProcess[]
): PriorityNonPreemptiveState {
  const initialState: PriorityNonPreemptiveState = {
    tick: 0,
    processes: input.map(p => ({ ...p, remainingTime: p.burstTime })), // Add remainingTime
    readyQueue: [],
    runningProcess: null,
    completedProcesses: [],
    currentTime: 0,
    params: params,
  };
  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: PriorityNonPreemptiveState): { nextState: PriorityNonPreemptiveState; event: Event } {
  let nextState = { ...state };
  let event: Event = { tick: nextState.tick, type: "noop", payload: null };

  nextState.currentTime = nextState.tick; // Update current time

  // 1. Process arrivals
  const arrivingProcesses = nextState.processes.filter(p => p.arrivalTime === nextState.currentTime);
  arrivingProcesses.forEach((p: PriorityNonPreemptiveInputProcess & { remainingTime: number }) => {
    nextState.readyQueue.push({ ...p }); // Add to ready queue with remaining time
    event = { tick: nextState.tick, type: "arrival", payload: { pid: p.pid, queueId: "ready" } }; // Assuming "ready" is a generic queue name
  });
  nextState.processes = nextState.processes.filter(p => p.arrivalTime !== nextState.currentTime); // Remove arrived processes

  // Sort ready queue after arrivals
  nextState.readyQueue = sortReadyQueue(nextState.readyQueue, nextState.params);

  // 2. Scheduling decision (NON-PREEMPTIVE)
  // If CPU is idle and there's a process in the ready queue, schedule it.
  // We only make a scheduling decision if the CPU is idle.
  if (!nextState.runningProcess && nextState.readyQueue.length > 0) {
    nextState.runningProcess = nextState.readyQueue.shift()!; // Take the highest priority process
    event = { tick: nextState.tick, type: "schedule", payload: { pid: nextState.runningProcess.pid, queueId: "ready" } };
  }

  // 3. Execute the running process
  if (nextState.runningProcess) {
    nextState.runningProcess.remainingTime!--;
    event = { tick: nextState.tick, type: "cpu-run", payload: { pid: nextState.runningProcess.pid } };

    // Check for completion
    if (nextState.runningProcess.remainingTime === 0) {
      const completed = { ...nextState.runningProcess, completionTime: nextState.currentTime + 1 };
      nextState.completedProcesses.push(completed);
      event = { tick: nextState.tick, type: "completion", payload: { pid: nextState.runningProcess.pid } };
      nextState.runningProcess = null; // CPU becomes idle
    }
  } else {
    // CPU is idle
    event = { tick: nextState.tick, type: "idle", payload: null };
  }

  // Update tick for the next iteration
  nextState.tick++;

  return { nextState, event };
}

// Run simulation to completion
export function runToCompletion(state: PriorityNonPreemptiveState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: PriorityNonPreemptiveState; metrics: any } {
  const timeline: Event[] = [];
  let currentState = { ...state };

  while (currentState.processes.length > 0 || currentState.readyQueue.length > 0 || currentState.runningProcess !== null) {
    const { nextState, event } = simulateStep(currentState);
    timeline.push(event);
    if (onEvent) {
      onEvent(event);
    }
    currentState = nextState;
  }

  // Calculate metrics
  const metrics = calculateMetrics(currentState);

  return { timeline, finalState: currentState, metrics };
}

// Calculate metrics (e.g., turnaround time, waiting time, response time)
function calculateMetrics(state: PriorityNonPreemptiveState) {
  const metrics = {
    turnaroundTime: {} as Record<number, number>,
    waitingTime: {} as Record<number, number>,
    responseTime: {} as Record<number, number>,
    totalSeekDistance: 0, // Not directly applicable for CPU scheduling, but can be used for other contexts
    pageFaults: 0, // Not applicable here
    hitRatio: 0, // Not applicable here
  };

  state.completedProcesses.forEach((p: PriorityNonPreemptiveInputProcess & { remainingTime: number; completionTime: number }) => {
    const completionTime = p.completionTime!;
    const turnaroundTime = completionTime - p.arrivalTime;
    metrics.turnaroundTime[p.pid] = turnaroundTime;

    const waitingTime = turnaroundTime - p.burstTime;
    metrics.waitingTime[p.pid] = waitingTime;

    // Response time is the time from arrival to first execution.
    // This requires tracking the first execution time, which is not explicitly in the current state.
    // For simplicity in this initial implementation, we'll use waitingTime as a proxy,
    // but a proper implementation would require tracking firstExecutionTime.
    metrics.responseTime[p.pid] = waitingTime; // Placeholder, needs proper tracking
  });

  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: PriorityNonPreemptiveState): any {
  // If the simulation is not complete, we might need to run it to completion first
  // Or, calculate metrics based on the current state if possible.
  // For now, assume it's called after runToCompletion.
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: PriorityNonPreemptiveState): any {
  return JSON.stringify(state);
}

// Deserialize state from storage
export function deserializeState(serialized: any): PriorityNonPreemptiveState {
  return JSON.parse(serialized);
}

// Describe an event for the ExplanationPanel
export function describeEvent(e: Event): string {
  switch (e.type) {
    case "arrival":
      return `Process ${e.payload.pid} arrived and entered the ready queue.`;
    case "schedule":
      return `Process ${e.payload.pid} is scheduled to run.`;
    case "cpu-run":
      return `Process ${e.payload.pid} is running.`;
    case "completion":
      return `Process ${e.payload.pid} completed.`;
    case "idle":
      return `CPU is idle.`;
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
