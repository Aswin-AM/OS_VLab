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

// Define the input structure for a process
type MultilevelQueueInputProcess = {
  pid: number;
  arrivalTime: number;
  burstTime: number;
  queueId: string; // Process is permanently assigned to a queue
};

// Define parameters for the Multilevel Queue algorithm
type MultilevelQueueParams = {
  queues: {
    id: string;
    policy: 'FCFS' | 'RR' | 'SJF'; // Scheduling policy within the queue
    quantum?: number; // Quantum for Round Robin
  }[];
  dispatchingRule: 'fixed-priority'; // Master scheduler rule: pick highest priority non-empty queue
};

// Define the state for the Multilevel Queue algorithm
type MultilevelQueueState = State & {
  processes: (MultilevelQueueInputProcess & { remainingTime: number })[]; // Processes yet to arrive
  readyQueues: Record<string, (MultilevelQueueInputProcess & { remainingTime: number })[]>; // Queues for processes ready to run
  runningProcess: (MultilevelQueueInputProcess & { remainingTime: number }) | null; // Currently running process
  completedProcesses: (MultilevelQueueInputProcess & { remainingTime: number; completionTime: number })[]; // Processes that have finished
  currentTime: number;
  params: MultilevelQueueParams;
  // Add any other state variables needed for simulation, e.g., for RR time slice tracking
  rrTimeSliceCounter: number;
};

// Helper to get the queue configuration by ID
function getQueueConfig(state: MultilevelQueueState, queueId: string) {
  return state.params.queues.find(q => q.id === queueId);
}

// Helper to sort a specific ready queue based on its policy
function sortQueue(
  queue: (MultilevelQueueInputProcess & { remainingTime: number })[],
  queueConfig: MultilevelQueueParams['queues'][0]
): (MultilevelQueueInputProcess & { remainingTime: number })[] {
  switch (queueConfig.policy) {
    case 'FCFS':
      // FCFS: sort by arrival time (or PID if arrival times are same)
      return [...queue].sort((a, b) => {
        if (a.arrivalTime !== b.arrivalTime) {
          return a.arrivalTime - b.arrivalTime;
        }
        return a.pid - b.pid;
      });
    case 'RR':
      // RR: order is maintained by arrival into the queue, but new arrivals go to end.
      // For simplicity, we assume the queue itself maintains order and we just take from front.
      // If a process is preempted, it goes to the end. This is handled in simulateStep.
      return queue; // No explicit sort needed here if queue management is correct
    case 'SJF':
      // SJF: sort by shortest remaining burst time
      return [...queue].sort((a, b) => {
        if (a.remainingTime !== b.remainingTime) {
          return a.remainingTime - b.remainingTime;
        }
        return a.pid - b.pid; // Tie-break with PID
      });
    default:
      return queue; // Should not happen
  }
}

// Initialize the state
export function init(
  params: MultilevelQueueParams,
  input: MultilevelQueueInputProcess[]
): MultilevelQueueState {
  const initialState: MultilevelQueueState = {
    tick: 0,
    processes: input.map(p => ({ ...p, remainingTime: p.burstTime })), // Add remainingTime
    readyQueues: {},
    runningProcess: null,
    completedProcesses: [],
    currentTime: 0,
    params: params,
    rrTimeSliceCounter: 0,
  };

  // Initialize empty ready queues for each defined queue
  params.queues.forEach(q => {
    initialState.readyQueues[q.id] = [];
  });

  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: MultilevelQueueState): { nextState: MultilevelQueueState; event: Event } {
  let nextState = { ...state };
  let event: Event = { tick: nextState.tick, type: "noop", payload: null };

  nextState.currentTime = nextState.tick; // Update current time

  // 1. Process arrivals
  const arrivingProcesses = nextState.processes.filter(p => p.arrivalTime === nextState.currentTime);
  arrivingProcesses.forEach((p: MultilevelQueueInputProcess & { remainingTime: number }) => {
    const queueConfig = getQueueConfig(nextState, p.queueId);
    if (queueConfig) {
      nextState.readyQueues[p.queueId].push({ ...p }); // Add to its designated queue
      event = { tick: nextState.tick, type: "enqueue", payload: { pid: p.pid, queueId: p.queueId } };
    } else {
      console.warn(`Process ${p.pid} arrived but its queueId '${p.queueId}' is not defined in params.`);
    }
  });
  nextState.processes = nextState.processes.filter(p => p.arrivalTime !== nextState.currentTime); // Remove arrived processes

  // Sort each ready queue based on its policy
  nextState.params.queues.forEach(qConfig => {
    nextState.readyQueues[qConfig.id] = sortQueue(nextState.readyQueues[qConfig.id], qConfig);
  });

  // 2. Scheduling decision (Master Scheduler: Fixed Priority)
  let highestPriorityQueueId: string | null = null;
  // Iterate through queues in the order they are defined in params (assuming this order implies priority)
  for (const qConfig of nextState.params.queues) {
    if (nextState.readyQueues[qConfig.id] && nextState.readyQueues[qConfig.id].length > 0) {
      highestPriorityQueueId = qConfig.id;
      break; // Found the highest priority non-empty queue
    }
  }

  // If a process is running, check if it needs to be preempted (only if RR policy is involved and time slice is up)
  // For fixed-priority dispatching, a lower priority queue process does NOT preempt a higher priority queue process.
  // Preemption only happens if a process within the SAME queue (e.g. RR) or if a higher priority queue becomes active.
  // The current logic assumes fixed-priority dispatching: a process from a lower priority queue only runs if all higher priority queues are empty.
  // If a process is running, and its queue is NOT the highest priority non-empty queue, it should be preempted.
  if (nextState.runningProcess) {
    const runningProcessQueueId = nextState.runningProcess.queueId;
    const runningProcessQueueConfig = getQueueConfig(nextState, runningProcessQueueId);

    // Check if the running process's queue is still the highest priority non-empty queue
    if (highestPriorityQueueId !== runningProcessQueueId) {
      // Preempt the current process if its queue is no longer the highest priority
      // This happens if a higher priority queue now has processes, or if the current process's queue is no longer the highest.
      const preemptedProcess = { ...nextState.runningProcess };
      // Add back to its original queue
      nextState.readyQueues[preemptedProcess.queueId].unshift(preemptedProcess); // Add to front to maintain order before re-sorting
      nextState.readyQueues[preemptedProcess.queueId] = sortQueue(nextState.readyQueues[preemptedProcess.queueId], runningProcessQueueConfig!);
      
      event = {
        tick: nextState.tick,
        type: "preemption", // Or "queue-switch" if it's a queue change
        payload: { fromPid: preemptedProcess.pid, toPid: null, fromQueueId: preemptedProcess.queueId, toQueueId: null }, // toPid is null as CPU becomes idle for now
      };
      nextState.runningProcess = null; // CPU is now free
    } else {
      // Process continues running, check for RR time slice
      const currentQueueConfig = getQueueConfig(nextState, runningProcessQueueId);
      if (currentQueueConfig && currentQueueConfig.policy === 'RR') {
        nextState.rrTimeSliceCounter++;
        if (nextState.rrTimeSliceCounter >= currentQueueConfig.quantum!) {
          // Time slice expired, preempt for RR
          const preemptedProcess = { ...nextState.runningProcess };
          // Add to the end of its queue
          nextState.readyQueues[preemptedProcess.queueId].push(preemptedProcess);
          nextState.readyQueues[preemptedProcess.queueId] = sortQueue(nextState.readyQueues[preemptedProcess.queueId], currentQueueConfig); // Re-sort if policy requires it
          
          event = {
            tick: nextState.tick,
            type: "preemption", // Or "queue-switch" if it's a queue change
            payload: { fromPid: preemptedProcess.pid, toPid: null, fromQueueId: preemptedProcess.queueId, toQueueId: null }, // toPid is null as CPU becomes idle for now
          };
          nextState.runningProcess = null; // CPU is now free
          nextState.rrTimeSliceCounter = 0; // Reset counter
        }
      }
    }
  }

  // If CPU is idle and there's a process in the highest priority ready queue, schedule it
  if (!nextState.runningProcess && highestPriorityQueueId) {
    const processToRun = nextState.readyQueues[highestPriorityQueueId].shift()!; // Take from front of the queue
    nextState.runningProcess = processToRun;
    nextState.rrTimeSliceCounter = 0; // Reset RR counter for new process
    event = { tick: nextState.tick, type: "schedule", payload: { pid: nextState.runningProcess.pid, queueId: highestPriorityQueueId } };
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
      nextState.rrTimeSliceCounter = 0; // Reset counter
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
export function runToCompletion(state: MultilevelQueueState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: MultilevelQueueState; metrics: any } {
  const timeline: Event[] = [];
  let currentState = { ...state };

  // Continue simulation as long as there are processes to arrive, in ready queues, or running
  while (currentState.processes.length > 0 || Object.values(currentState.readyQueues).some(q => q.length > 0) || currentState.runningProcess !== null) {
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
function calculateMetrics(state: MultilevelQueueState) {
  const metrics = {
    turnaroundTime: {} as Record<number, number>,
    waitingTime: {} as Record<number, number>,
    responseTime: {} as Record<number, number>,
    // Other metrics specific to Multilevel Queue (e.g., starvation) could be added here
  };

  state.completedProcesses.forEach((p: MultilevelQueueInputProcess & { remainingTime: number; completionTime: number }) => {
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
export function getMetrics(state: MultilevelQueueState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: MultilevelQueueState): any {
  return JSON.stringify(state);
}

// Deserialize state from storage
export function deserializeState(serialized: any): MultilevelQueueState {
  return JSON.parse(serialized);
}

// Describe an event for the ExplanationPanel
export function describeEvent(e: Event): string {
  switch (e.type) {
    case "enqueue":
      return `Process ${e.payload.pid} enqueued into queue ${e.payload.queueId}.`;
    case "dequeue":
      return `Process ${e.payload.pid} dequeued from queue ${e.payload.queueId}.`;
    case "schedule":
      return `Process ${e.payload.pid} from queue ${e.payload.queueId} is scheduled to run.`;
    case "cpu-run":
      return `Process ${e.payload.pid} is running.`;
    case "completion":
      return `Process ${e.payload.pid} completed.`;
    case "preemption":
      return `Process ${e.payload.fromPid} was preempted from queue ${e.payload.fromQueueId}.`;
    case "idle":
      return `CPU is idle.`;
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
