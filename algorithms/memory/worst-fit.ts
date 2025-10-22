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

// Define the structure for a memory block (free or allocated)
type MemoryBlock = {
  start: number;
  size: number;
  pid?: number; // Only present if allocated
};

// Define the input structure for the Worst Fit algorithm
type WorstFitInput = {
  memorySize: number;
  freeList: MemoryBlock[]; // Initial layout of free memory blocks
  requests: {
    pid: number;
    size: number;
    allocTime: number;
    releaseTime: number; // Time at which the process releases the memory
  }[];
};

// Define parameters for the Worst Fit algorithm
type WorstFitParams = {
  // No specific parameters for Worst Fit itself
};

// Define the state for the Worst Fit algorithm
type WorstFitState = State & {
  memorySize: number;
  freeBlocks: MemoryBlock[]; // Current list of free memory blocks
  allocatedBlocks: MemoryBlock[]; // Current list of allocated memory blocks
  pendingRequests: WorstFitInput['requests']; // Requests yet to be processed
  // Type for completedRequests to properly include optional allocated properties
  completedRequests: Array<WorstFitInput['requests'][0] & { allocatedStart?: number; allocatedSize?: number }>; // Requests that have been processed
  currentTime: number;
  params: WorstFitParams;
};

// Helper function to merge adjacent free blocks
function mergeFreeBlocks(blocks: MemoryBlock[]): MemoryBlock[] {
  if (blocks.length === 0) return [];

  // Sort blocks by start address to facilitate merging
  blocks.sort((a, b) => a.start - b.start);

  const merged: MemoryBlock[] = [];
  let currentBlock = { ...blocks[0] };

  for (let i = 1; i < blocks.length; i++) {
    const nextBlock = blocks[i];
    // If the next block starts immediately after the current block, merge them
    if (currentBlock.start + currentBlock.size === nextBlock.start) {
      currentBlock.size += nextBlock.size;
    } else {
      // Otherwise, push the current block and start a new one
      merged.push(currentBlock);
      currentBlock = { ...nextBlock };
    }
  }
  // Push the last merged block
  merged.push(currentBlock);

  return merged;
}

// Initialize the state
export function init(
  params: WorstFitParams,
  input: WorstFitInput
): WorstFitState {
  // Ensure initial free list is merged and sorted
  const initialFreeBlocks = mergeFreeBlocks(input.freeList);

  const initialState: WorstFitState = {
    tick: 0,
    memorySize: input.memorySize,
    freeBlocks: initialFreeBlocks,
    allocatedBlocks: [],
    pendingRequests: input.requests.sort((a, b) => a.allocTime - b.allocTime), // Sort requests by allocation time
    completedRequests: [],
    currentTime: 0,
    params: params,
  };
  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: WorstFitState): { nextState: WorstFitState; event: Event } {
  let nextState = { ...state };
  let event: Event = { tick: nextState.tick, type: "noop", payload: null };

  nextState.currentTime = nextState.tick; // Update current time

  // 1. Process memory releases
  const releasingRequests = nextState.completedRequests.filter(req => req.releaseTime === nextState.currentTime);
  releasingRequests.forEach((req: WorstFitInput['requests'][0] & { allocatedStart?: number; allocatedSize?: number }) => {
    if (req.allocatedStart !== undefined && req.allocatedSize !== undefined) {
      // Remove from allocated blocks
      nextState.allocatedBlocks = nextState.allocatedBlocks.filter(
        block => !(block.start === req.allocatedStart && block.size === req.allocatedSize && block.pid === req.pid)
      );
      // Add to free blocks
      nextState.freeBlocks.push({ start: req.allocatedStart, size: req.allocatedSize });
      // Merge free blocks to prevent fragmentation
      nextState.freeBlocks = mergeFreeBlocks(nextState.freeBlocks);
      event = { tick: nextState.tick, type: "release", payload: { pid: req.pid, start: req.allocatedStart, size: req.allocatedSize } };
    }
  });

  // 2. Process memory allocations
  const allocatingRequests = nextState.pendingRequests.filter(req => req.allocTime === nextState.currentTime);
  allocatingRequests.forEach(req => {
    let worstFitBlock: MemoryBlock | null = null;
    let worstFitBlockIndex = -1;
    let maxWastedSpace = -1; // Initialize with -1 to ensure any valid block is chosen

    // Find the largest free block that is large enough
    for (let i = 0; i < nextState.freeBlocks.length; i++) {
      const block = nextState.freeBlocks[i];
      if (block.size >= req.size) {
        const wastedSpace = block.size - req.size;
        if (wastedSpace > maxWastedSpace) {
          maxWastedSpace = wastedSpace;
          worstFitBlock = block;
          worstFitBlockIndex = i;
        }
      }
    }

    if (worstFitBlock) {
      // Allocate memory
      const allocatedStart = worstFitBlock.start;
      const allocatedSize = req.size;
      const remainingSize = worstFitBlock.size - allocatedSize;

      // Update free blocks: remove the used block, add remaining part if any
      nextState.freeBlocks.splice(worstFitBlockIndex, 1); // Remove the block
      if (remainingSize > 0) {
        nextState.freeBlocks.push({ start: allocatedStart + allocatedSize, size: remainingSize });
      }
      // Add to allocated blocks
      nextState.allocatedBlocks.push({ start: allocatedStart, size: allocatedSize, pid: req.pid });
      
      // Update the request with allocation details
      const updatedRequest = { ...req, allocatedStart, allocatedSize };
      nextState.completedRequests.push(updatedRequest);
      nextState.pendingRequests = nextState.pendingRequests.filter(r => r.pid !== req.pid); // Remove from pending

      event = { tick: nextState.tick, type: "allocSuccess", payload: { pid: req.pid, start: allocatedStart, size: allocatedSize } };
    } else {
      // Allocation failed
      nextState.completedRequests.push({ ...req, allocatedStart: undefined, allocatedSize: undefined }); // Mark as processed but failed
      nextState.pendingRequests = nextState.pendingRequests.filter(r => r.pid !== req.pid); // Remove from pending
      event = { tick: nextState.tick, type: "allocFail", payload: { pid: req.pid, requestedSize: req.size } };
    }
  });

  // Update tick for the next iteration
  nextState.tick++;

  return { nextState, event };
}

// Run simulation to completion
export function runToCompletion(state: WorstFitState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: WorstFitState; metrics: any } {
  const timeline: Event[] = [];
  let currentState = { ...state };

  // Continue simulation as long as there are pending requests or active allocations
  // A more robust condition might be needed if processes can arrive/release at arbitrary times.
  // For this model, we assume all requests have defined allocTime and releaseTime.
  // We need to run until all pending requests are processed and all allocated blocks are released.
  const maxReleaseTime = Math.max(0, ...currentState.completedRequests.map(r => r.releaseTime || 0));
  const maxAllocTime = Math.max(0, ...currentState.pendingRequests.map(r => r.allocTime));
  const simulationEndTime = Math.max(maxAllocTime, maxReleaseTime) + 1; // Run a bit beyond the last event

  while (currentState.currentTime < simulationEndTime || currentState.pendingRequests.length > 0 || currentState.allocatedBlocks.length > 0) {
    // If no more pending requests and no running processes, but there are completed requests with release times in the future,
    // we need to advance time to the next release time.
    if (currentState.pendingRequests.length === 0 && currentState.allocatedBlocks.length === 0 && currentState.completedRequests.length > 0) {
        const nextReleaseTime = Math.min(...currentState.completedRequests
            .filter(req => req.releaseTime !== undefined && req.releaseTime > currentState.currentTime)
            .map(req => req.releaseTime));
        if (nextReleaseTime !== Infinity && nextReleaseTime > currentState.currentTime) {
            // Jump time to the next release event
            const timeToAdvance = nextReleaseTime - currentState.currentTime;
            for (let i = 0; i < timeToAdvance; i++) {
                timeline.push({ tick: currentState.tick + i, type: "noop", payload: null });
            }
            currentState.tick += timeToAdvance;
            currentState.currentTime = currentState.tick;
            continue; // Restart loop to process releases at the new currentTime
        }
    }

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

// Calculate metrics (e.g., fragmentation, utilization)
function calculateMetrics(state: WorstFitState) {
  const metrics = {
    totalMemory: state.memorySize,
    allocatedMemory: state.allocatedBlocks.reduce((sum, block) => sum + block.size, 0),
    freeMemory: state.freeBlocks.reduce((sum, block) => sum + block.size, 0),
    externalFragmentation: state.freeBlocks.reduce((sum, block) => sum + block.size, 0), // Sum of all free blocks
    // Could also calculate internal fragmentation if block sizes were fixed or requests were rounded up.
    // For contiguous allocation, internal fragmentation is less of a concern unless requests are rounded up.
    // Utilization: (allocatedMemory / totalMemory) * 100
    // Could also track average block size, number of allocations/deallocations, etc.
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: WorstFitState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: WorstFitState): any {
  return JSON.stringify(state);
}

// Deserialize state from storage
export function deserializeState(serialized: any): WorstFitState {
  return JSON.parse(serialized);
}

// Describe an event for the ExplanationPanel
export function describeEvent(e: Event): string {
  switch (e.type) {
    case "allocAttempt": // Not explicitly used, but could be
      return `Attempting to allocate memory for process ${e.payload.pid}.`;
    case "allocSuccess":
      return `Process ${e.payload.pid} allocated memory at ${e.payload.start} with size ${e.payload.size}.`;
    case "allocFail":
      return `Failed to allocate memory for process ${e.payload.pid} (requested size ${e.payload.requestedSize}).`;
    case "release":
      return `Process ${e.payload.pid} released memory at ${e.payload.start} (size ${e.payload.size}).`;
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
