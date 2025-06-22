import { create } from 'zustand';
import { generateId } from '@/lib/utils';
import { BlockTypes } from '@/constants/blockTypes';
import type { Block, BlockProperties } from '@/types/block';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  title: string;
  type: string;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}


export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface SimulationState {
  isRunning: boolean;
  currentTime: number;
  sampleTime: number;
  duration: number;
  data: Record<string, number[]>;
}

export interface WorkbenchState {
  // UI State
  sidebarExpanded: boolean;
  selectedTool: string | null;

  // Project State
  projectName: string;
  lastSaved: Date | null;

  // Canvas State
  blocks: Block[];
  connections: Connection[];
  selectedBlocks: string[];
  canvasZoom: number;

  // Simulation State
  simulation: SimulationState;

  // Window Management
  windows: WindowState[];
  maxZIndex: number;

  // Actions
  toggleSidebar: () => void;
  setSelectedTool: (tool: string | null) => void;
  setProjectName: (name: string) => void;

  // Block Management
  addBlock: (type: string, position: Position) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  selectBlock: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  updateBlocks: (blocks: Block[]) => void;
  updateConnections: (connections: Connection[]) => void;

  // Window Management
  openWindow: (type: string, title: string, position?: Position, size?: Size) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: Position) => void;
  updateWindowSize: (id: string, size: Size) => void;
  bringWindowToFront: (id: string) => void;

  // Canvas Actions
  setCanvasZoom: (zoom: number) => void;
  addConnection: (connection: Omit<Connection, 'id'>) => void;
  removeConnection: (id: string) => void;

  // Simulation Actions
  startSimulation: () => void;
  stopSimulation: () => void;
  updateSimulationData: (blockId: string, data: number[]) => void;
  setSimulationTime: (time: number) => void;
}

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  // Initial UI State
  sidebarExpanded: false,
  selectedTool: null,

  // Initial Project State
  projectName: 'Untitled Project',
  lastSaved: null,

  // Initial Canvas State
  blocks: [],
  connections: [],
  selectedBlocks: [],
  canvasZoom: 100,

  // Initial Simulation State
  simulation: {
    isRunning: false,
    currentTime: 0,
    sampleTime: 0.01,
    duration: 10,
    data: {},
  },

  // Initial Window State
  windows: [],
  maxZIndex: 0,

  // Actions
  toggleSidebar: () => set((state) => ({ 
    sidebarExpanded: !state.sidebarExpanded 
  })),

  setSelectedTool: (tool) => set({ selectedTool: tool }),

  setProjectName: (name) => set({ projectName: name }),

  // Block Management
  addBlock: (type, position) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      position,
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        properties: getDefaultProperties(type),
      },
    };

    set((state) => ({
      blocks: [...state.blocks, newBlock],
      selectedBlocks: [newBlock.id],
    }));
  },

  updateBlock: (id, updates) => set((state) => ({
    blocks: state.blocks.map((block) =>
      block.id === id ? { ...block, ...updates } : block
    ),
  })),

  removeBlock: (id) => set((state) => ({
    blocks: state.blocks.filter((block) => block.id !== id),
    connections: state.connections.filter(
      (conn) => conn.source !== id && conn.target !== id
    ),
    selectedBlocks: state.selectedBlocks.filter((blockId) => blockId !== id),
  })),

  selectBlock: (id, multi = false) => set((state) => ({
    selectedBlocks: multi 
      ? state.selectedBlocks.includes(id)
        ? state.selectedBlocks.filter((blockId) => blockId !== id)
        : [...state.selectedBlocks, id]
      : [id],
  })),

  clearSelection: () => set({ selectedBlocks: [] }),

  updateBlocks: (blocks) => {
    set({ blocks });
  },

  updateConnections: (connections) => {
    set({ connections });
  },

  // Window Management
  openWindow: (type, title, position = { x: 100, y: 100 }, size = { width: 400, height: 300 }) => {
    const newWindow: WindowState = {
      id: generateId(),
      title,
      type,
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: get().maxZIndex + 1,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      maxZIndex: state.maxZIndex + 1,
    }));
  },

  closeWindow: (id) => set((state) => ({
    windows: state.windows.filter((window) => window.id !== id),
  })),

  minimizeWindow: (id) => set((state) => ({
    windows: state.windows.map((window) =>
      window.id === id ? { ...window, isMinimized: !window.isMinimized } : window
    ),
  })),

  maximizeWindow: (id) => set((state) => ({
    windows: state.windows.map((window) =>
      window.id === id ? { ...window, isMaximized: !window.isMaximized } : window
    ),
  })),

  updateWindowPosition: (id, position) => set((state) => ({
    windows: state.windows.map((window) =>
      window.id === id ? { ...window, position } : window
    ),
  })),

  updateWindowSize: (id, size) => set((state) => ({
    windows: state.windows.map((window) =>
      window.id === id ? { ...window, size } : window
    ),
  })),

  bringWindowToFront: (id) => set((state) => ({
    windows: state.windows.map((window) =>
      window.id === id ? { ...window, zIndex: state.maxZIndex + 1 } : window
    ),
    maxZIndex: state.maxZIndex + 1,
  })),

  // Canvas Actions
  setCanvasZoom: (zoom) => set({ canvasZoom: zoom }),

  addConnection: (connection) => {
    const newConnection: Connection = {
      ...connection,
      id: generateId(),
    };

    set((state) => ({
      connections: [...state.connections, newConnection],
    }));
  },

  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter((conn) => conn.id !== id),
  })),

  // Simulation Actions
  startSimulation: () => set((state) => ({
    simulation: { ...state.simulation, isRunning: true, currentTime: 0 },
  })),

  stopSimulation: () => set((state) => ({
    simulation: { ...state.simulation, isRunning: false },
  })),

  updateSimulationData: (blockId, data) => set((state) => ({
    simulation: {
      ...state.simulation,
      data: { ...state.simulation.data, [blockId]: data },
    },
  })),

  setSimulationTime: (time) => set((state) => ({
    simulation: { ...state.simulation, currentTime: time },
  })),
}));

function getDefaultProperties(type: string): BlockProperties {
  switch (type) {
    case BlockTypes.PID_CONTROLLER:
      return { kp: 1.0, ki: 0.1, kd: 0.05, sampleTime: 0.01 };
    case BlockTypes.TRANSFER_FUNCTION:
      return { numerator: [1], denominator: [1, 2, 1] };
    case BlockTypes.GAIN_BLOCK:
      return { gain: 1.0 };
    case BlockTypes.STEP_INPUT:
      return { amplitude: 1.0, stepTime: 0.0 };
    case BlockTypes.SINE_WAVE:
      return { amplitude: 1.0, frequency: 1.0, phase: 0.0 };
    default:
      return {};
  }
}