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

// Define the structure for a disk request
type DiskRequest = {
  id: number; // Unique identifier for the request
  arrivalTime: number; // Time the request arrives
  track: number; // The track number the request needs to access
};

// Define parameters for the SSTF algorithm
type SstfParams = {
  diskSize: number; // Total number of tracks on the disk
  // No specific parameters for SSTF itself, but could include logic for starvation handling
};

// Define the state for the SSTF algorithm
type SstfState = State & {
  diskSize: number;
  requests: DiskRequest[]; // All requests, sorted by arrival time
  pendingRequests: DiskRequest[]; // Requests that have arrived but not yet served
  servedRequests: DiskRequest[]; // Requests that have been served
  currentHeadPosition: number; // Current position of the disk head
  currentTime: number;
  params: SstfParams;
  totalHeadMovement: number;
};

// Initialize the state
export function init(
  params: SstfParams,
  input: { requests: DiskRequest[] } // Assuming input is an object containing requests
): SstfState {
  const initialState: SstfState = {
    tick: 0,
    diskSize: params.diskSize,
    requests: input.requests.sort((a, b) => a.arrivalTime - b.arrivalTime), // Sort requests by arrival time
    pendingRequests: [],
    servedRequests: [],
    currentHeadPosition: 0, // Assuming head starts at track 0
    currentTime: 0,
    params: params,
    totalHeadMovement: 0,
  };
  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: SstfState): { nextState: SstfState; event: Event } {
  let nextState = { ...state };
  let event: Event = { tick: nextState.tick, type: "noop", payload: null };

  nextState.currentTime = nextState.tick; // Update current time

  // 1. Process arrivals
  const arrivingRequests = nextState.requests.filter(req => req.arrivalTime === nextState.currentTime);
  arrivingRequests.forEach(req => {
    nextState.pendingRequests.push(req);
    event = { tick: nextState.tick, type: "arrival", payload: { requestId: req.id, track: req.track } };
  });
  nextState.requests = nextState.requests.filter(req => req.arrivalTime !== nextState.currentTime); // Remove arrived requests

  // 2. Serve requests if head is idle and there are pending requests
  if (nextState.pendingRequests.length > 0) {
    // SSTF: find the request closest to the current head position
    let closestRequest: DiskRequest | null = null;
    let closestRequestIndex = -1;
    let minSeekDistance = Infinity;

    for (let i = 0; i < nextState.pendingRequests.length; i++) {
      const request = nextState.pendingRequests[i];
      const seekDistance = Math.abs(request.track - nextState.currentHeadPosition);

      if (seekDistance < minSeekDistance) {
        minSeekDistance = seekDistance;
        closestRequest = request;
        closestRequestIndex = i;
      } else if (seekDistance === minSeekDistance) {
        // Tie-breaking: FCFS for requests with the same seek distance
        // If the current closest request arrived earlier, keep it.
        // Otherwise, update to the new request if it arrived earlier.
        if (closestRequest && request.arrivalTime < closestRequest.arrivalTime) {
          closestRequest = request;
          closestRequestIndex = i;
        }
      }
    }

    if (closestRequest) {
      const requestToServe = closestRequest;
      const targetTrack = requestToServe.track;

      // Calculate head movement
      const movement = Math.abs(targetTrack - nextState.currentHeadPosition);
      nextState.totalHeadMovement += movement;

      // Update head position
      nextState.currentHeadPosition = targetTrack;

      // Record the head-move event
      event = {
        tick: nextState.tick,
        type: "head-move",
        payload: { from: state.currentHeadPosition, to: nextState.currentHeadPosition, seekDistance: movement },
      };

      // Remove the served request from pending
      nextState.pendingRequests.splice(closestRequestIndex, 1);
      // Mark request as served
      nextState.servedRequests.push(requestToServe);
      // Record the served event
      event = { tick: nextState.tick, type: "served", payload: { requestId: requestToServe.id, track: targetTrack } };
    } else {
      // This case should ideally not happen if pendingRequests.length > 0
      event = { tick: nextState.tick, type: "idle", payload: null };
    }
  } else {
    // No pending requests, head is idle
    event = { tick: nextState.tick, type: "idle", payload: null };
  }

  // Update tick for the next iteration
  nextState.tick++;

  return { nextState, event };
}

// Run simulation to completion
export function runToCompletion(state: SstfState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: SstfState; metrics: any } {
  const timeline: Event[] = [];
  let currentState = { ...state };

  // Continue simulation as long as there are requests to arrive or pending requests
  while (currentState.requests.length > 0 || currentState.pendingRequests.length > 0) {
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
function calculateMetrics(state: SstfState) {
  const metrics = {
    totalHeadMovement: state.totalHeadMovement,
    // Could add average seek time, number of requests served, etc.
    // Starvation metric could be added here if implemented
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: SstfState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: SstfState): any {
  return JSON.stringify(state);
}

// Deserialize state from storage
export function deserializeState(serialized: any): SstfState {
  return JSON.parse(serialized);
}

// Describe an event for the ExplanationPanel
export function describeEvent(e: Event): string {
  switch (e.type) {
    case "arrival":
      return `Request ${e.payload.requestId} for track ${e.payload.track} arrived.`;
    case "head-move":
      return `Disk head moved from track ${e.payload.from} to ${e.payload.to}, seeking ${e.payload.seekDistance} tracks.`;
    case "served":
      return `Request ${e.payload.requestId} for track ${e.payload.track} was served.`;
    case "idle":
      return `Disk head is idle.`;
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
