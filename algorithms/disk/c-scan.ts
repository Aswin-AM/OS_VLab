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

// Define parameters for the C-SCAN algorithm
type CScanParams = {
  diskSize: number; // Total number of tracks on the disk
  startDirection: "increasing" | "decreasing"; // Initial direction of head movement
};

// Define the state for the C-SCAN algorithm
type CScanState = State & {
  diskSize: number;
  requests: DiskRequest[]; // All requests, sorted by arrival time
  pendingRequests: DiskRequest[]; // Requests that have arrived but not yet served
  servedRequests: DiskRequest[]; // Requests that have been served
  currentHeadPosition: number; // Current position of the disk head
  currentTime: number;
  params: CScanParams;
  totalHeadMovement: number;
  currentDirection: "increasing" | "decreasing"; // Current direction of head movement
};

// Initialize the state
export function init(
  params: CScanParams,
  input: { requests: DiskRequest[] } // Assuming input is an object containing requests
): CScanState {
  const initialState: CScanState = {
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
export function simulateStep(state: CScanState): { nextState: CScanState; event: Event } {
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
    // C-SCAN: find the next request in the current direction
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
      // If there are pending requests, but none in the current direction, we must reverse direction and jump.
      if (nextState.pendingRequests.length > 0) {
        // Reverse direction and jump to the other end of the disk
        const currentDirection = nextState.currentDirection;
        const endTrack = currentDirection === "increasing" ? nextState.diskSize - 1 : 0;
        const jumpTrack = currentDirection === "increasing" ? 0 : nextState.diskSize - 1;

        // Move to the end of the disk in the current direction
        const movementToEnd = Math.abs(endTrack - nextState.currentHeadPosition);
        nextState.totalHeadMovement += movementToEnd;
        nextState.currentHeadPosition = endTrack;

        event = {
          tick: nextState.tick,
          type: "head-move",
          payload: { from: state.currentHeadPosition, to: nextState.currentHeadPosition, seekDistance: movementToEnd, reversing: true },
        };

        // Now, jump to the other end of the disk
        const movementToJump = Math.abs(jumpTrack - nextState.currentHeadPosition);
        nextState.totalHeadMovement += movementToJump;
        nextState.currentHeadPosition = jumpTrack;

        event = {
          tick: nextState.tick,
          type: "head-move",
          payload: { from: endTrack, to: nextState.currentHeadPosition, seekDistance: movementToJump, jumping: true },
        };

        // Switch direction
        nextState.currentDirection = currentDirection === "increasing" ? "decreasing" : "increasing";
        // After jumping and reversing, the next step will pick up requests in the new direction.
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
export function runToCompletion(state: CScanState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: CScanState; metrics: any } {
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
function calculateMetrics(state: CScanState) {
  const metrics = {
    totalHeadMovement: state.totalHeadMovement,
    // Could add average seek time, number of requests served, etc.
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: CScanState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: CScanState): any {
  return JSON.stringify(state);
}

// Deserialize state from storage
export function deserializeState(serialized: any): CScanState {
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
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
