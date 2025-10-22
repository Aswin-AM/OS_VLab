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

// Define the structure for a process's resource needs
type ProcessResources = {
  pid: number;
  max: number[]; // Maximum resources the process might need
  allocation: number[]; // Currently allocated resources
  need: number[]; // Remaining resources needed (max - allocation)
};

// Define the input structure for the Banker's Algorithm
type BankersInput = {
  numResources: number;
  available: number[]; // Array of available resources
  processes: ProcessResources[];
  // Define the sequence of resource requests
  requests: {
    pid: number;
    request: number[]; // Resources requested by the process
  }[];
};

// Define parameters for the Banker's Algorithm
type BankersParams = {
  // No specific parameters for Banker's Algorithm itself
};

// Define the state for the Banker's Algorithm
type BankersState = State & {
  numResources: number;
  available: number[]; // Current available resources
  processes: ProcessResources[]; // All processes with their resource details
  requests: BankersInput['requests']; // Resource requests to be processed
  currentRequestIndex: number; // Index of the current request being processed
  params: BankersParams;
  // For safety check:
  work: number[]; // Copy of available resources
  finish: boolean[]; // Array indicating if a process has finished
  need: number[][]; // Matrix of remaining resources needed by each process
  safetySequence: number[]; // The sequence of processes that can finish
};

// Helper to calculate the 'need' matrix
function calculateNeedMatrix(processes: ProcessResources[]): number[][] {
  return processes.map(p => p.max.map((maxVal, i) => maxVal - p.allocation[i]));
}

// Helper to check if a process can be granted a request
function canGrantRequest(
  process: ProcessResources,
  request: number[],
  available: number[]
): boolean {
  for (let i = 0; i < request.length; i++) {
    if (request[i] > process.need[i] || request[i] > available[i]) {
      return false;
    }
  }
  return true;
}

// Helper to perform a safety check
function isSafeState(
  numResources: number,
  available: number[],
  processes: ProcessResources[],
  need: number[][],
  finish: boolean[]
): { safe: boolean; sequence: number[] } {
  const work = [...available];
  const currentFinish = [...finish];
  const sequence: number[] = [];

  let foundProcess = true;
  while (foundProcess) {
    foundProcess = false;
    for (let i = 0; i < processes.length; i++) {
      if (!currentFinish[i]) {
        let canAllocate = true;
        for (let j = 0; j < numResources; j++) {
          if (need[i][j] > work[j]) {
            canAllocate = false;
            break;
          }
        }

        if (canAllocate) {
          // Allocate resources to this process
          for (let j = 0; j < numResources; j++) {
            work[j] += processes[i].allocation[j];
          }
          currentFinish[i] = true;
          sequence.push(processes[i].pid);
          foundProcess = true;
          break; // Found a process, restart the loop to find another
        }
      }
    }
  }

  // Check if all processes finished
  const allFinished = currentFinish.every(f => f === true);
  return { safe: allFinished, sequence: sequence };
}

// Initialize the state
export function init(
  params: BankersParams,
  input: BankersInput
): BankersState {
  const needMatrix = calculateNeedMatrix(input.processes);
  const initialState: BankersState = {
    tick: 0,
    numResources: input.numResources,
    available: [...input.available],
    processes: input.processes.map(p => ({ ...p, need: calculateNeedMatrix([p])[0] })), // Add need to process object for easier access
    requests: input.requests,
    currentRequestIndex: 0,
    params: params,
    work: [...input.available], // Initialize work
    finish: Array(input.processes.length).fill(false), // Initialize finish array
    need: needMatrix,
    safetySequence: [],
  };
  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: BankersState): { nextState: BankersState; event: Event } {
  let nextState = { ...state };
  let event: Event = { tick: nextState.tick, type: "noop", payload: null };

  // Check if all requests have been processed
  if (nextState.currentRequestIndex >= nextState.requests.length) {
    return { nextState, event: { tick: nextState.tick, type: "end", payload: null } };
  }

  const currentRequest = nextState.requests[nextState.currentOperationIndex];
  const processIndex = nextState.processes.findIndex(p => p.pid === currentRequest.pid);

  if (processIndex === -1) {
    console.error(`Error: Process ${currentRequest.pid} not found.`);
    nextState.currentRequestIndex++;
    nextState.tick++;
    return { nextState, event: { tick: nextState.tick, type: "error", payload: { message: "Process not found" } } };
  }

  const process = nextState.processes[processIndex];
  const request = currentRequest.request;

  // Check if the request is valid (i.e., request <= need)
  let isValidRequest = true;
  for (let i = 0; i < request.length; i++) {
    if (request[i] > process.need[i]) {
      isValidRequest = false;
      break;
    }
  }

  if (!isValidRequest) {
    console.error(`Error: Process ${currentRequest.pid} requested more resources than its maximum need.`);
    event = { tick: nextState.tick, type: "requestDenied", payload: { pid: process.pid, reason: "Exceeds maximum need" } };
  } else {
    // Check if the request can be granted (request <= available)
    if (canGrantRequest(process, request, nextState.available)) {
      // Tentatively grant the request
      const newAvailable = [...nextState.available];
      const newAllocation = [...process.allocation];
      const newNeed = [...process.need];

      for (let i = 0; i < request.length; i++) {
        newAvailable[i] -= request[i];
        newAllocation[i] += request[i];
        newNeed[i] -= request[i];
      }

      // Perform safety check
      const safetyCheckResult = isSafeState(
        nextState.numResources,
        newAvailable,
        nextState.processes,
        nextState.need.map((row, idx) => idx === processIndex ? newNeed : row), // Update need for the current process
        nextState.finish.map((f, idx) => idx === processIndex ? true : f) // Mark current process as potentially finished for safety check
      );

      if (safetyCheckResult.safe) {
        // Grant the request
        process.allocation = newAllocation;
        process.need = newNeed;
        nextState.available = newAvailable;
        nextState.finish[processIndex] = true; // Mark as finished for this safety check context
        nextState.safetySequence = safetyCheckResult.sequence; // Store the safety sequence
        event = { tick: nextState.tick, type: "granted", payload: { pid: process.pid, request: request, sequence: safetyCheckResult.sequence } };
      } else {
        // Request denied because it leads to an unsafe state
        event = { tick: nextState.tick, type: "denied", payload: { pid: process.pid, request: request, reason: "Unsafe state" } };
      }
    } else {
      // Request denied because not enough resources are available
      event = { tick: nextState.tick, type: "denied", payload: { pid: process.pid, request: request, reason: "Insufficient available resources" } };
    }
  }

  // Move to the next request
  nextState.currentRequestIndex++;
  nextState.tick++; // Increment tick for the next step

  return { nextState, event };
}

// Run simulation to completion
export function runToCompletion(state: BankersState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: BankersState; metrics: any } {
  const timeline: Event[] = [];
  let currentState = { ...state };

  while (currentState.currentRequestIndex < currentState.requests.length) {
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

// Calculate metrics
function calculateMetrics(state: BankersState) {
  const metrics = {
    safetySequence: state.safetySequence,
    // Could add metrics like number of denied requests, etc.
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: BankersState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: BankersState): any {
  return JSON.stringify(state);
}

// Deserialize state from storage
export function deserializeState(serialized: any): BankersState {
  return JSON.parse(serialized);
}

// Describe an event for the ExplanationPanel
export function describeEvent(e: Event): string {
  switch (e.type) {
    case "granted":
      return `Request for PID ${e.payload.pid} granted. Resources: [${e.payload.request.join(', ')}]. Safety Sequence: [${e.payload.sequence.join(', ')}]`;
    case "denied":
      return `Request for PID ${e.payload.pid} denied. Reason: ${e.payload.reason}.`;
    case "end":
      return `Banker's Algorithm simulation finished.`;
    case "error":
      return `Error: ${e.payload.message}`;
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
