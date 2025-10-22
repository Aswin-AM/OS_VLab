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

// Define parameters for the LOOK algorithm
type LookParams = {
  diskSize: number; // Total number of tracks on the disk
  startDirection: "increasing" | "decreasing"; // Initial direction of head movement
};

// Define the state for the LOOK algorithm
type LookState = State & {
  diskSize: number;
  requests: DiskRequest[]; // All requests, sorted by arrival time
  pendingRequests: DiskRequest[]; // Requests that have arrived but not yet served
  servedRequests: DiskRequest[]; // Requests that have been served
  currentHeadPosition: number; // Current position of the disk head
  currentTime: number;
  params: LookParams;
  totalHeadMovement: number;
  currentDirection: "increasing" | "decreasing"; // Current direction of head movement
};

// Initialize the state
export function init(
  params: LookParams,
  input: { requests: DiskRequest[] } // Assuming input is an object containing requests
): LookState {
  const initialState: LookState = {
    tick: 0,
    diskSize: params.diskSize,
    requests: input.requests.sort((a, b) => a.arrivalTime - b.arrivalTime), // Sort requests by arrival time
    pendingRequests: [],
    servedRequests: [],
    currentHeadPosition: 0, // Assuming head starts at track 0
    currentTime: 0,
    params: params,
    totalHeadMovement: 0,
    currentDirection: params.startDirection, // Set initial direction
  };
  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: LookState): { nextState: LookState; event: Event } {
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
    // LOOK: find the next request in the current direction
    let nextRequest: DiskRequest | null = null;
    let nextRequestIndex = -1;

    // Filter requests that are in the current direction of movement
    const requestsInDirection = nextState.pendingRequests.filter(req => {
      if (nextState.currentDirection === "increasing") {
        return req.track >= nextState.currentHeadPosition;
      } else { // "decreasing"
        return req.track <= nextState.currentHeadPosition;
      }
    });

    if (requestsInDirection.length > 0) {
      // Sort these requests by track number according to the current direction
      requestsInDirection.sort((a, b) => {
        if (nextState.currentDirection === "increasing") {
          return a.track - b.track;
        } else {
          return b.track - a.track;
        }
      });
      // The first request in the sorted list is the next one to serve
      nextRequest = requestsInDirection[0];
      nextRequestIndex = nextState.pendingRequests.findIndex(req => req.id === nextRequest!.id); // Find its index in the original pending list
    }

    if (nextRequest) {
      const requestToServe = nextRequest;
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
      nextState.pendingRequests.splice(nextRequestIndex, 1);
      // Mark request as served
      nextState.servedRequests.push(requestToServe);
      // Record the served event
      event = { tick: nextState.tick, type: "served", payload: { requestId: requestToServe.id, track: targetTrack } };
    } else {
      // No requests in the current direction. Need to check if there are any pending requests at all.
      // If there are pending requests, but none in the current direction, we must reverse direction.
      if (nextState.pendingRequests.length > 0) {
        // Reverse direction
        nextState.currentDirection = nextState.currentDirection === "increasing" ? "decreasing" : "increasing";
        // For LOOK, we don't necessarily move to the end of the disk, but rather to the closest request in the new direction.
        // However, if there are no requests in the new direction, the head might just stay put or move to the closest request.
        // For simplicity in this simulation, we'll assume the head doesn't move until a request is found in the new direction.
        // If no requests are found in the new direction, the head remains idle until a new request arrives or the direction changes again.
        // A more accurate simulation would involve finding the closest request in the new direction.
        // For now, we just change direction and wait for the next tick.
        event = {
          tick: nextState.tick,
          type: "direction-change",
          payload: { newDirection: nextState.currentDirection },
        };
      } else {
        // No pending requests at all, head is idle
        event = { tick: nextState.tick, type: "idle", payload: null };
      }
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
export function runToCompletion(state: LookState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: LookState; metrics: any } {
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
function calculateMetrics(state: LookState) {
  const metrics = {
    totalHeadMovement: state.totalHeadMovement,
    // Could add average seek time, number of requests served, etc.
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: LookState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: LookState): any {
  return JSON.stringify(state);
}

// Deserialize state from storage
export function deserializeState(serialized: any): LookState {
  return JSON.parse(serialized);
}

// Describe an event for the ExplanationPanel
export function describeEvent(e: Event): string {
  switch (e.type) {
    case "arrival":
      return `Request ${e.payload.requestId} for track ${e.payload.track} arrived.`;
    case "head-move":
      let description = `Disk head moved from track ${e.payload.from} to ${e.payload.to}, seeking ${e.payload.seekDistance} tracks.`;
      if (e.payload.reversing) {
        description += " (Direction reversed)";
      }
      if (e.payload.jumping) {
        description += " (Jumped to other end)";
      }
      return description;
    case "served":
      return `Request ${e.payload.requestId} for track ${e.payload.track} was served.`;
    case "idle":
      return `Disk head is idle.`;
    case "direction-change":
      return `Disk head direction changed to ${e.payload.newDirection}.`;
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
