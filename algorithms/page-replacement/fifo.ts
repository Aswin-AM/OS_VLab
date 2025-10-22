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

// Define the input structure for the FIFO Page Replacement algorithm
type FifoInput = {
  frames: number; // Number of frames in physical memory
  reference: number[]; // Sequence of page references
};

// Define parameters for the FIFO algorithm
type FifoParams = {
  // No specific parameters for FIFO itself
};

// Define the state for the FIFO algorithm
type FifoState = State & {
  frames: number; // Number of frames
  referenceString: number[]; // The sequence of page references
  pageTable: Map<number, number>; // Maps page number to frame number (or just presence)
  framesContent: (number | null)[]; // Content of each frame (page number or null if empty)
  frameQueue: number[]; // Queue to track page arrival order in frames (FIFO)
  pageFaults: number;
  hits: number;
  currentIndex: number; // Current position in the reference string
  params: FifoParams;
};

// Initialize the state
export function init(
  params: FifoParams,
  input: FifoInput
): FifoState {
  const initialState: FifoState = {
    tick: 0,
    frames: input.frames,
    referenceString: input.reference,
    pageTable: new Map(), // Initially empty
    framesContent: Array(input.frames).fill(null), // All frames are empty
    frameQueue: [], // FIFO queue for frame replacement
    pageFaults: 0,
    hits: 0,
    currentIndex: 0,
    params: params,
  };
  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: FifoState): { nextState: FifoState; event: Event } {
  let nextState = { ...state };
  let event: Event = { tick: nextState.tick, type: "noop", payload: null };

  // Check if we have processed all references
  if (nextState.currentIndex >= nextState.referenceString.length) {
    return { nextState, event: { tick: nextState.tick, type: "end", payload: null } };
  }

  const currentPage = nextState.referenceString[nextState.currentIndex];

  // Check if the page is already in a frame (page hit)
  if (nextState.pageTable.has(currentPage)) {
    nextState.hits++;
    event = { tick: nextState.tick, type: "page-access", payload: { page: currentPage, hit: true } };
  } else {
    // Page fault
    nextState.pageFaults++;
    event = { tick: nextState.tick, type: "page-access", payload: { page: currentPage, hit: false } };

    // Find a free frame or replace a page
    if (nextState.frameQueue.length < nextState.frames) {
      // There is a free frame
      const frameIndex = nextState.frameQueue.length; // Use the next available frame index
      nextState.framesContent[frameIndex] = currentPage;
      nextState.pageTable.set(currentPage, frameIndex);
      nextState.frameQueue.push(currentPage); // Add to the FIFO queue
      event = { tick: nextState.tick, type: "page-fault", payload: { page: currentPage, frame: frameIndex } };
    } else {
      // All frames are occupied, need to replace a page using FIFO
      const pageToReplace = nextState.frameQueue.shift()!; // Get the oldest page from the queue
      const frameIndexToReplace = nextState.pageTable.get(pageToReplace)!; // Find its frame index

      // Remove the old page from the page table
      nextState.pageTable.delete(pageToReplace);
      // Update the frame content
      nextState.framesContent[frameIndexToReplace] = currentPage;
      // Add the new page to the page table and the FIFO queue
      nextState.pageTable.set(currentPage, frameIndexToReplace);
      nextState.frameQueue.push(currentPage);

      event = { tick: nextState.tick, type: "page-fault", payload: { page: currentPage, replacedPage: pageToReplace, frame: frameIndexToReplace } };
    }
  }

  // Move to the next reference
  nextState.currentIndex++;
  nextState.tick++; // Increment tick for the next step

  return { nextState, event };
}

// Run simulation to completion
export function runToCompletion(state: FifoState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: FifoState; metrics: any } {
  const timeline: Event[] = [];
  let currentState = { ...state };

  while (currentState.currentIndex < currentState.referenceString.length) {
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
function calculateMetrics(state: FifoState) {
  const metrics = {
    pageFaults: state.pageFaults,
    hits: state.hits,
    hitRatio: state.referenceString.length > 0 ? (state.hits / state.referenceString.length) * 100 : 0,
    faultRatio: state.referenceString.length > 0 ? (state.pageFaults / state.referenceString.length) * 100 : 0,
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: FifoState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: FifoState): any {
  // Convert Map to a serializable format
  const serializablePageTable = Array.from(state.pageTable.entries());
  return JSON.stringify({ ...state, pageTable: serializablePageTable });
}

// Deserialize state from storage
export function deserializeState(serialized: any): FifoState {
  const parsed = JSON.parse(serialized);
  // Convert back from array to Map
  parsed.pageTable = new Map(parsed.pageTable);
  return parsed;
}

// Describe an event for the ExplanationPanel
export function describeEvent(e: Event): string {
  switch (e.type) {
    case "page-access":
      return `Page ${e.payload.page} accessed. ${e.payload.hit ? 'Page Hit.' : 'Page Fault.'}`;
    case "page-fault":
      if (e.payload.replacedPage !== undefined) {
        return `Page fault for page ${e.payload.page}. Replaced page ${e.payload.replacedPage} in frame ${e.payload.frame}.`;
      } else {
        return `Page fault for page ${e.payload.page}. Loaded into frame ${e.payload.frame}.`;
      }
    case "end":
      return `Simulation finished.`;
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
