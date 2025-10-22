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

// Define the input structure for the Optimal Page Replacement algorithm
type OptimalInput = {
  frames: number; // Number of frames in physical memory
  reference: number[]; // Sequence of page references
};

// Define parameters for the Optimal algorithm
type OptimalParams = {
  // No specific parameters for Optimal itself
};

// Define the state for the Optimal algorithm
type OptimalState = State & {
  frames: number; // Number of frames
  referenceString: number[]; // The sequence of page references
  // pageTable now maps page number to frame index directly, as Optimal doesn't track usage time
  pageTable: Map<number, number>; // Maps page number to frame number
  framesContent: (number | null)[]; // Content of each frame (page number or null if empty)
  pageFaults: number;
  hits: number;
  currentIndex: number; // Current position in the reference string
  params: OptimalParams;
};

// Helper function to find the page to be replaced using the Optimal algorithm
function findPageToReplace(
  state: OptimalState
): { pageToReplace: number; frameIndex: number } | null {
  if (state.pageTable.size < state.frames) {
    // Should not happen if called when frames are full
    return null;
  }

  let pageToReplace: number | null = null;
  let frameIndexToReplace: number = -1;
  let furthestUseTick = -1;

  // Iterate through all pages currently in frames
  for (const [page, frameIndex] of state.pageTable.entries()) {
    let nextUseTick = Infinity;
    // Find the next occurrence of this page in the reference string
    for (let i = state.currentIndex + 1; i < state.referenceString.length; i++) {
      if (state.referenceString[i] === page) {
        nextUseTick = i;
        break;
      }
    }

    // If this page is never used again, it's the optimal candidate
    if (nextUseTick === Infinity) {
      pageToReplace = page;
      frameIndexToReplace = frameIndex;
      break; // Found the page to replace
    }

    // Otherwise, track the page that will be used furthest in the future
    if (nextUseTick > furthestUseTick) {
      furthestUseTick = nextUseTick;
      pageToReplace = page;
      frameIndexToReplace = frameIndex;
    }
  }

  if (pageToReplace !== null && frameIndexToReplace !== -1) {
    return { pageToReplace, frameIndex: frameIndexToReplace };
  }
  return null; // Should not happen if frames are full
}

// Initialize the state
export function init(
  params: OptimalParams,
  input: OptimalInput
): OptimalState {
  const initialState: OptimalState = {
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
export function simulateStep(state: OptimalState): { nextState: OptimalState; event: Event } {
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
        nextState.pageTable.set(currentPage, frameIndex); // Store frame index directly
        event = { tick: nextState.tick, type: "page-fault", payload: { page: currentPage, frame: frameIndex } };
      } else {
        // This case should ideally not happen if pageTable.size < frames
        console.error("Optimal logic error: No free frame found despite pageTable.size < frames");
      }
    } else {
      // All frames are occupied, need to replace a page using Optimal
      const replacementInfo = findPageToReplace(nextState);

      if (replacementInfo) {
        const { pageToReplace, frameIndex } = replacementInfo;

        // Remove the page to be replaced from the page table
        nextState.pageTable.delete(pageToReplace);
        // Update the frame content with the new page
        nextState.framesContent[frameIndex] = currentPage;
        // Add the new page to the page table
        nextState.pageTable.set(currentPage, frameIndex); // Store frame index directly

        event = { tick: nextState.tick, type: "page-fault", payload: { page: currentPage, replacedPage: pageToReplace, frame: frameIndex } };
      } else {
        // This case should ideally not happen if frames are full
        console.error("Optimal logic error: Could not find page to replace.");
      }
    }
  }

  // Move to the next reference
  nextState.currentIndex++;
  nextState.tick++; // Increment tick for the next step

  return { nextState, event };
}

// Run simulation to completion
export function runToCompletion(state: OptimalState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: OptimalState; metrics: any } {
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
function calculateMetrics(state: OptimalState) {
  const metrics = {
    pageFaults: state.pageFaults,
    hits: state.hits,
    hitRatio: state.referenceString.length > 0 ? (state.hits / state.referenceString.length) * 100 : 0,
    faultRatio: state.referenceString.length > 0 ? (state.pageFaults / state.referenceString.length) * 100 : 0,
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: OptimalState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: OptimalState): any {
  // Convert Map to a serializable format
  const serializablePageTable = Array.from(state.pageTable.entries());
  return JSON.stringify({ ...state, pageTable: serializablePageTable });
}

// Deserialize state from storage
export function deserializeState(serialized: any): OptimalState {
  const parsed = JSON.parse(serialized); // Corrected typo: JSON.JSON.parse -> JSON.parse
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
