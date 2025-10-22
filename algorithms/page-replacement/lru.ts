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

// Define the input structure for the LRU Page Replacement algorithm
type LruInput = {
  frames: number; // Number of frames in physical memory
  reference: number[]; // Sequence of page references
};

// Define parameters for the LRU algorithm
type LruParams = {
  // No specific parameters for LRU itself
};

// Define the state for the LRU algorithm
type LruState = State & {
  frames: number; // Number of frames
  referenceString: number[]; // The sequence of page references
  pageTable: Map<number, { frameIndex: number; lastUsedTick: number }>; // Maps page number to frame index and last used tick
  framesContent: (number | null)[]; // Content of each frame (page number or null if empty)
  pageFaults: number;
  hits: number;
  currentIndex: number; // Current position in the reference string
  params: LruParams;
};

// Initialize the state
export function init(
  params: LruParams,
  input: LruInput
): LruState {
  const initialState: LruState = {
    tick: 0,
    frames: input.frames,
    referenceString: input.reference,
    pageTable: new Map(), // Initially empty
    framesContent: Array(input.frames).fill(null), // All frames are empty
    pageFaults: 0,
    hits: 0,
    currentIndex: 0,
    params: params,
  };
  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: LruState): { nextState: LruState; event: Event } {
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
    // Update the last used tick for the accessed page
    const pageInfo = nextState.pageTable.get(currentPage)!;
    pageInfo.lastUsedTick = nextState.tick;
    nextState.pageTable.set(currentPage, pageInfo);

    event = { tick: nextState.tick, type: "page-access", payload: { page: currentPage, hit: true } };
  } else {
    // Page fault
    nextState.pageFaults++;
    event = { tick: nextState.tick, type: "page-access", payload: { page: currentPage, hit: false } };

    // Find a free frame or replace a page
    if (nextState.pageTable.size < nextState.frames) {
      // There is a free frame
      // Find the first available frame index
      let frameIndex = -1;
      for (let i = 0; i < nextState.framesContent.length; i++) {
        if (nextState.framesContent[i] === null) {
          frameIndex = i;
          break;
        }
      }

      if (frameIndex !== -1) {
        nextState.framesContent[frameIndex] = currentPage;
        nextState.pageTable.set(currentPage, { frameIndex: frameIndex, lastUsedTick: nextState.tick });
        event = { tick: nextState.tick, type: "page-fault", payload: { page: currentPage, frame: frameIndex } };
      } else {
        // This case should ideally not happen if pageTable.size < frames
        console.error("LRU logic error: No free frame found despite pageTable.size < frames");
      }
    } else {
      // All frames are occupied, need to replace a page using LRU
      let lruPage: number | null = null;
      let lruFrameIndex: number = -1;
      let minLastUsedTick = Infinity;

      // Find the page with the minimum lastUsedTick
      for (const [page, info] of nextState.pageTable.entries()) {
        if (info.lastUsedTick < minLastUsedTick) {
          minLastUsedTick = info.lastUsedTick;
          lruPage = page;
          lruFrameIndex = info.frameIndex;
        }
      }

      if (lruPage !== null && lruFrameIndex !== -1) {
        // Remove the LRU page from the page table
        nextState.pageTable.delete(lruPage);
        // Update the frame content with the new page
        nextState.framesContent[lruFrameIndex] = currentPage;
        // Add the new page to the page table
        nextState.pageTable.set(currentPage, { frameIndex: lruFrameIndex, lastUsedTick: nextState.tick });

        event = { tick: nextState.tick, type: "page-fault", payload: { page: currentPage, replacedPage: lruPage, frame: lruFrameIndex } };
      } else {
        // This case should ideally not happen if frames are full
        console.error("LRU logic error: Could not find LRU page to replace.");
      }
    }
  }

  // Move to the next reference
  nextState.currentIndex++;
  nextState.tick++; // Increment tick for the next step

  return { nextState, event };
}

// Run simulation to completion
export function runToCompletion(state: LruState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: LruState; metrics: any } {
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
function calculateMetrics(state: LruState) {
  const metrics = {
    pageFaults: state.pageFaults,
    hits: state.hits,
    hitRatio: state.referenceString.length > 0 ? (state.hits / state.referenceString.length) * 100 : 0,
    faultRatio: state.referenceString.length > 0 ? (state.pageFaults / state.referenceString.length) * 100 : 0,
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: LruState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: LruState): any {
  // Convert Map to a serializable format
  const serializablePageTable = Array.from(state.pageTable.entries());
  return JSON.stringify({ ...state, pageTable: serializablePageTable });
}

// Deserialize state from storage
export function deserializeState(serialized: any): LruState {
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
