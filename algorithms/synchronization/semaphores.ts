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

// Define the structure for a semaphore
type Semaphore = {
  id: string; // Unique identifier for the semaphore
  value: number; // The current value of the semaphore
  waitQueue: number[]; // PIDs of processes waiting on this semaphore
};

// Define the structure for a process
type Process = {
  pid: number; // Process ID
  state: "running" | "waiting" | "ready" | "terminated"; // Current state of the process
  // Other process properties can be added here
};

// Define the input structure for the Semaphores algorithm
type SemaphoresInput = {
  semaphores: Semaphore[];
  processes: Process[];
  // Define the sequence of operations (wait/signal) for each process
  operations: {
    pid: number;
    semaphoreId: string;
    type: "wait" | "signal";
    // Assuming operations are processed in the order they appear in the array,
    // or could have an arrivalTime if they are time-dependent.
    // For simplicity, we'll process them sequentially.
  }[];
};

// Define parameters for the Semaphores algorithm
type SemaphoresParams = {
  // No specific parameters for Semaphores itself
};

// Define the state for the Semaphores algorithm
type SemaphoresState = State & {
  semaphores: Semaphore[];
  processes: Process[];
  operations: SemaphoresInput['operations']; // Operations to be processed
  currentOperationIndex: number; // Index of the current operation being processed
  params: SemaphoresParams;
};

// Helper to find a semaphore by its ID
function findSemaphore(state: SemaphoresState, semaphoreId: string): Semaphore | undefined {
  return state.semaphores.find(s => s.id === semaphoreId);
}

// Helper to find a process by its PID
function findProcess(state: SemaphoresState, pid: number): Process | undefined {
  return state.processes.find(p => p.pid === pid);
}

// Initialize the state
export function init(
  params: SemaphoresParams,
  input: SemaphoresInput
): SemaphoresState {
  const initialState: SemaphoresState = {
    tick: 0,
    semaphores: input.semaphores,
    processes: input.processes,
    operations: input.operations, // Operations are processed sequentially
    currentOperationIndex: 0,
    params: params,
  };
  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: SemaphoresState): { nextState: SemaphoresState; event: Event } {
  let nextState = { ...state };
  let event: Event = { tick: nextState.tick, type: "noop", payload: null };

  // Check if all operations have been processed
  if (nextState.currentOperationIndex >= nextState.operations.length) {
    return { nextState, event: { tick: nextState.tick, type: "end", payload: null } };
  }

  const currentOperation = nextState.operations[nextState.currentOperationIndex];
  const process = findProcess(nextState, currentOperation.pid);
  const semaphore = findSemaphore(nextState, currentOperation.semaphoreId);

  if (!process || !semaphore) {
    console.error(`Error: Process or Semaphore not found for operation ${currentOperation.pid} on ${currentOperation.semaphoreId}`);
    // Skip this operation and move to the next
    nextState.currentOperationIndex++;
    nextState.tick++;
    return { nextState, event: { tick: nextState.tick, type: "error", payload: { message: "Process or Semaphore not found" } } };
  }

  if (currentOperation.type === "wait") {
    if (semaphore.value > 0) {
      // Decrement semaphore value and allow process to proceed
      semaphore.value--;
      process.state = "running"; // Assume it proceeds to running state
      event = { tick: nextState.tick, type: "enterCS", payload: { pid: process.pid, semaphoreId: semaphore.id } };
    } else {
      // Block the process and add to wait queue
      process.state = "waiting";
      semaphore.waitQueue.push(process.pid);
      event = { tick: nextState.tick, type: "waitBlocked", payload: { pid: process.pid, semaphoreId: semaphore.id } };
    }
  } else if (currentOperation.type === "signal") {
    // Increment semaphore value
    semaphore.value++;
    // If there are processes waiting, unblock one
    if (semaphore.waitQueue.length > 0) {
      const pidToUnblock = semaphore.waitQueue.shift()!;
      const processToUnblock = findProcess(nextState, pidToUnblock);
      if (processToUnblock) {
        processToUnblock.state = "running"; // Assume it proceeds to running state
        event = { tick: nextState.tick, type: "signal", payload: { pid: processToUnblock.pid, semaphoreId: semaphore.id } };
      }
    } else {
      // No processes waiting, just incremented value
      event = { tick: nextState.tick, type: "signal", payload: { pid: process.pid, semaphoreId: semaphore.id } };
    }
  }

  // Move to the next operation
  nextState.currentOperationIndex++;
  nextState.tick++; // Increment tick for the next step

  return { nextState, event };
}

// Run simulation to completion
export function runToCompletion(state: SemaphoresState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: SemaphoresState; metrics: any } {
  const timeline: Event[] = [];
  let currentState = { ...state };

  while (currentState.currentOperationIndex < currentState.operations.length) {
    const { nextState, event } = simulateStep(currentState);
    timeline.push(event);
    if (onEvent) {
      onEvent(event);
    }
    currentState = nextState;
  }

  // Calculate metrics (if any are defined for semaphores)
  const metrics = calculateMetrics(currentState);

  return { timeline, finalState: currentState, metrics };
}

// Calculate metrics
function calculateMetrics(state: SemaphoresState) {
  const metrics = {
    // Metrics could include: number of context switches, number of blocked processes, etc.
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: SemaphoresState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: SemaphoresState): any {
  return JSON.stringify(state);
}

// Deserialize state from storage
export function deserializeState(serialized: any): SemaphoresState {
  return JSON.parse(serialized);
}

// Describe an event for the ExplanationPanel
export function describeEvent(e: Event): string {
  switch (e.type) {
    case "enterCS":
      return `Process ${e.payload.pid} entered critical section for semaphore ${e.payload.semaphoreId}.`;
    case "waitBlocked":
      return `Process ${e.payload.pid} blocked on semaphore ${e.payload.semaphoreId}.`;
    case "signal":
      return `Semaphore ${e.payload.semaphoreId} signaled by process ${e.payload.pid}.`;
    case "end":
      return `Semaphore simulation finished.`;
    case "error":
      return `Error: ${e.payload.message}`;
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
