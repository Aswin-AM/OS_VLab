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

// Define the structure for a shared buffer item
type BufferItem = number | string | null;

// Define the structure for a producer process
type ProducerProcess = {
  pid: number;
  state: "running" | "waiting" | "ready" | "terminated";
};

// Define the structure for a consumer process
type ConsumerProcess = {
  pid: number;
  state: "running" | "waiting" | "ready" | "terminated";
};

// Define the input structure for the Producer-Consumer algorithm
type ProducerConsumerInput = {
  bufferSize: number;
  producers: ProducerProcess[];
  consumers: ConsumerProcess[];
  // Define the sequence of operations (produce/consume)
  operations: {
    type: "produce" | "consume";
    pid: number; // PID of the producer or consumer
    item?: BufferItem; // Item produced or consumed
  }[];
};

// Define parameters for the Producer-Consumer algorithm
type ProducerConsumerParams = {
  // No specific parameters for Producer-Consumer itself
};

// Define the state for the Producer-Consumer algorithm
type ProducerConsumerState = State & {
  bufferSize: number;
  buffer: BufferItem[]; // The shared buffer
  inIndex: number; // Index for producer to insert item
  outIndex: number; // Index for consumer to remove item
  producerCount: number; // Number of producers
  consumerCount: number; // Number of consumers
  producers: ProducerProcess[];
  consumers: ConsumerProcess[];
  operations: ProducerConsumerInput['operations']; // Operations to be processed
  currentOperationIndex: number; // Index of the current operation being processed
  params: ProducerConsumerParams;
  // Semaphores or monitors would typically be used here, but for simulation, we'll use flags/queues
  emptySlots: number; // Number of empty slots in the buffer
  fullSlots: number; // Number of full slots in the buffer
  producerWaitQueue: number[]; // PIDs of producers waiting for empty slots
  consumerWaitQueue: number[]; // PIDs of consumers waiting for full slots
};

// Initialize the state
export function init(
  params: ProducerConsumerParams,
  input: ProducerConsumerInput
): ProducerConsumerState {
  const initialState: ProducerConsumerState = {
    tick: 0,
    bufferSize: input.bufferSize,
    buffer: Array(input.bufferSize).fill(null),
    inIndex: 0,
    outIndex: 0,
    producerCount: input.producers.length,
    consumerCount: input.consumers.length,
    producers: input.producers,
    consumers: input.consumers,
    operations: input.operations, // Operations are processed sequentially
    currentOperationIndex: 0,
    params: params,
    emptySlots: input.bufferSize, // Initially all slots are empty
    fullSlots: 0, // Initially no slots are full
    producerWaitQueue: [],
    consumerWaitQueue: [],
  };
  return initialState;
}

// Simulate one step of the algorithm
export function simulateStep(state: ProducerConsumerState): { nextState: ProducerConsumerState; event: Event } {
  let nextState = { ...state };
  let event: Event = { tick: nextState.tick, type: "noop", payload: null };

  // Check if all operations have been processed
  if (nextState.currentOperationIndex >= nextState.operations.length) {
    return { nextState, event: { tick: nextState.tick, type: "end", payload: null } };
  }

  const currentOperation = nextState.operations[nextState.currentOperationIndex];
  
  // Find the process associated with the operation
  let processFound = false;
  if (currentOperation.type === "produce") {
    const producer = nextState.producers.find(p => p.pid === currentOperation.pid);
    if (producer) {
      processFound = true;
      // Producer logic
      if (nextState.emptySlots > 0) {
        // There is space in the buffer, produce the item
        const itemToProduce = currentOperation.item !== undefined ? currentOperation.item : `item_${currentOperation.pid}_${nextState.tick}`; // Default item if not provided
        nextState.buffer[nextState.inIndex] = itemToProduce;
        nextState.inIndex = (nextState.inIndex + 1) % nextState.bufferSize;
        nextState.emptySlots--;
        nextState.fullSlots++;
        producer.state = "running"; // Assume it proceeds
        event = { tick: nextState.tick, type: "produce", payload: { pid: producer.pid, item: itemToProduce, bufferIndex: (nextState.inIndex - 1 + nextState.bufferSize) % nextState.bufferSize } };

        // If there were consumers waiting, wake one up
        if (nextState.consumerWaitQueue.length > 0) {
          const pidToWake = nextState.consumerWaitQueue.shift()!;
          const consumerToWake = nextState.consumers.find(c => c.pid === pidToWake);
          if (consumerToWake) {
            consumerToWake.state = "running"; // Assume it proceeds
          }
        }
      } else {
        // Buffer is full, producer must wait
        producer.state = "waiting";
        nextState.producerWaitQueue.push(producer.pid);
        event = { tick: nextState.tick, type: "producerBlocked", payload: { pid: producer.pid } };
      }
    }
  } else if (currentOperation.type === "consume") {
    const consumer = nextState.consumers.find(p => p.pid === currentOperation.pid);
    if (consumer) {
      processFound = true;
      // Consumer logic
      if (nextState.fullSlots > 0) {
        // There are items in the buffer, consume one
        const consumedItem = nextState.buffer[nextState.outIndex];
        nextState.buffer[nextState.outIndex] = null; // Clear the slot
        nextState.outIndex = (nextState.outIndex + 1) % nextState.bufferSize;
        nextState.fullSlots--;
        nextState.emptySlots++;
        consumer.state = "running"; // Assume it proceeds
        event = { tick: nextState.tick, type: "consume", payload: { pid: consumer.pid, item: consumedItem, bufferIndex: (nextState.outIndex - 1 + nextState.bufferSize) % nextState.bufferSize } };

        // If there were producers waiting, wake one up
        if (nextState.producerWaitQueue.length > 0) {
          const pidToWake = nextState.producerWaitQueue.shift()!;
          const producerToWake = nextState.producers.find(p => p.pid === pidToWake);
          if (producerToWake) {
            producerToWake.state = "running"; // Assume it proceeds
          }
        }
      } else {
        // Buffer is empty, consumer must wait
        consumer.state = "waiting";
        nextState.consumerWaitQueue.push(consumer.pid);
        event = { tick: nextState.tick, type: "consumerBlocked", payload: { pid: consumer.pid } };
      }
    }
  }

  if (!processFound) {
    console.error(`Error: Process not found for operation ${currentOperation.pid}`);
    // Skip this operation and move to the next
    nextState.currentOperationIndex++;
    nextState.tick++;
    return { nextState, event: { tick: nextState.tick, type: "error", payload: { message: "Process not found" } } };
  }

  // Move to the next operation
  nextState.currentOperationIndex++;
  nextState.tick++; // Increment tick for the next step

  return { nextState, event };
}

// Run simulation to completion
export function runToCompletion(state: ProducerConsumerState, onEvent?: (e: Event) => void): { timeline: Event[]; finalState: ProducerConsumerState; metrics: any } {
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

  // Calculate metrics (if any are defined for producer-consumer)
  const metrics = calculateMetrics(currentState);

  return { timeline, finalState: currentState, metrics };
}

// Calculate metrics
function calculateMetrics(state: ProducerConsumerState) {
  const metrics = {
    // Metrics could include: number of items produced/consumed, buffer utilization, etc.
  };
  return metrics;
}

// Get metrics from a completed state
export function getMetrics(state: ProducerConsumerState): any {
  return calculateMetrics(state);
}

// Serialize state for storage
export function serializeState(state: ProducerConsumerState): any {
  return JSON.stringify(state);
}

// Deserialize state from storage
export function deserializeState(serialized: any): ProducerConsumerState {
  return JSON.parse(serialized);
}

// Describe an event for the ExplanationPanel
export function describeEvent(e: Event): string {
  switch (e.type) {
    case "produce":
      return `Producer ${e.payload.pid} produced ${e.payload.item} at buffer index ${e.payload.bufferIndex}.`;
    case "consume":
      return `Consumer ${e.payload.pid} consumed ${e.payload.item} from buffer index ${e.payload.bufferIndex}.`;
    case "producerBlocked":
      return `Producer ${e.payload.pid} blocked because the buffer is full.`;
    case "consumerBlocked":
      return `Consumer ${e.payload.pid} blocked because the buffer is empty.`;
    case "end":
      return `Producer-Consumer simulation finished.`;
    case "error":
      return `Error: ${e.payload.message}`;
    case "noop":
      return `No operation.`;
    default:
      return `Unknown event type: ${e.type}`;
  }
}
