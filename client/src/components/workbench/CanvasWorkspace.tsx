import { useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  NodeTypes,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import { useWorkbenchStore } from "@/store/workbench";

// Custom node component with standard control system symbols
function ControlBlock({ data }: { data: any }) {
  const getSymbol = () => {
    const label = data.label.toLowerCase();

    if (label.includes("pid")) {
      return (
        <div className="w-16 h-12 border-2 border-foreground bg-transparent flex items-center justify-center">
          <div className="text-xs font-bold">PID</div>
        </div>
      );
    }

    if (label.includes("plant") || label.includes("transfer")) {
      return (
        <div className="w-20 h-12 border-2 border-foreground bg-background flex items-center justify-center">
          <div className="text-xs text-center">
            <div>G(s)</div>
          </div>
        </div>
      );
    }

    if (label.includes("gain")) {
      return (
        <div className="w-12 h-12 flex items-center justify-center transform rotate-45">
          <div className="w-full h-full border-2 border-foreground bg-background flex items-center justify-center">
            <div className="text-xs font-bold transform -rotate-45">K</div>
          </div>
        </div>
      );
    }

    if (label.includes("step")) {
      return (
        <div className="w-16 h-12 flex items-center justify-center">
          <svg
            width="48"
            height="36"
            viewBox="0 0 48 36"
            className="stroke-foreground fill-none stroke-2"
          >
            <path d="M4 28 L4 18 L20 18 L20 8 L44 8" />
          </svg>
        </div>
      );
    }

    if (label.includes("sensor")) {
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <div className="w-full h-full border-2 border-foreground bg-background rounded-full flex items-center justify-center">
            <div className="text-xs font-bold">H</div>
          </div>
        </div>
      );
    }

    if (label.includes("sine")) {
      return (
        <div className="w-16 h-12 flex items-center justify-center">
          <svg
            width="48"
            height="36"
            viewBox="0 0 48 36"
            className="stroke-foreground fill-none stroke-2"
          >
            <path d="M4 18 Q12 8 20 18 T36 18 Q40 14 44 18" />
          </svg>
        </div>
      );
    }

    // Default rectangular block
    return (
      <div className="w-16 h-12 border-2 border-foreground bg-background flex items-center justify-center">
        <div className="text-xs text-center">{data.label}</div>
      </div>
    );
  };

  const label = data.label.toLowerCase();
  const isSensor = label.includes("sensor");

  return (
    <div className="select-none">
      {!isSensor && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 bg-primary border-0"
        />
      )}

      {isSensor && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2 bg-primary border-0"
        />
      )}

      {getSymbol()}

      {data.subtitle && (
        <div className="text-[8px] text-muted-foreground text-center mt-1 leading-tight max-w-20">
          {data.subtitle}
        </div>
      )}

      {!isSensor && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-primary border-0"
        />
      )}

      {isSensor && (
        <Handle
          type="source"
          position={Position.Left}
          className="w-2 h-2 bg-primary border-0"
        />
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  controlBlock: ControlBlock,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "controlBlock",
    position: { x: 50, y: 150 },
    data: {
      label: "Step Input",
      subtitle: "Amp=1.0",
    },
  },
  {
    id: "2",
    type: "controlBlock",
    position: { x: 200, y: 150 },
    data: {
      label: "PID Controller",
      subtitle: "Kp=2, Ki=0.5, Kd=0.1",
    },
  },
  {
    id: "3",
    type: "controlBlock",
    position: { x: 350, y: 150 },
    data: {
      label: "Plant Model",
      subtitle: "1/(s²+2s+1)",
    },
  },
  {
    id: "4",
    type: "controlBlock",
    position: { x: 500, y: 150 },
    data: {
      label: "Gain Block",
      subtitle: "K=1.0",
    },
  },
  {
    id: "5",
    type: "controlBlock",
    position: { x: 350, y: 250 },
    data: {
      label: "Sensor",
      subtitle: "K=1.0",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.Arrow,
      color: "hsl(var(--primary))",
    },
    style: {
      stroke: "hsl(var(--primary))",
      strokeWidth: 2,
    },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.Arrow,
      color: "hsl(var(--primary))",
    },
    style: {
      stroke: "hsl(var(--primary))",
      strokeWidth: 2,
    },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.Arrow,
      color: "hsl(var(--primary))",
    },
    style: {
      stroke: "hsl(var(--primary))",
      strokeWidth: 2,
    },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.Arrow,
      color: "hsl(var(--primary))",
    },
    style: {
      stroke: "hsl(var(--primary))",
      strokeWidth: 2,
    },
  },
  {
    id: "e5-2",
    source: "5",
    target: "2",
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.Arrow,
      color: "hsl(var(--primary))",
    },
    style: {
      stroke: "hsl(var(--primary))",
      strokeWidth: 2,
    },
  },
];

export default function CanvasWorkspace() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    selectedTool,
    setSelectedTool,
    addBlock,
    updateBlocks,
    updateConnections,
  } = useWorkbenchStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Sync ReactFlow state with workbench store
  useEffect(() => {
    // Convert ReactFlow nodes to workbench blocks
    const blocks = nodes.map((node) => ({
      id: node.id,
      type: getBlockTypeFromLabel(node.data.label),
      position: node.position,
      data: {
        label: node.data.label,
        subtitle: node.data.subtitle,
        properties: getPropertiesFromSubtitle(node.data.subtitle),
      },
    }));

    // Convert ReactFlow edges to workbench connections
    const connections = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || "output",
      targetHandle: edge.targetHandle || "input",
    }));

    updateBlocks(blocks);
    updateConnections(connections);
  }, [nodes, edges, updateBlocks, updateConnections]);

  const handleCanvasDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const tool = event.dataTransfer.getData("tool");
      if (!tool || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: event.clientX - canvasRect.left - 60, // Center the block
        y: event.clientY - canvasRect.top - 30,
      };

      // Create new node
      const newNode: Node = {
        id: `${Date.now()}`,
        type: "controlBlock",
        position,
        data: {
          label: tool
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          subtitle: getSubtitleForTool(tool),
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedTool(null);
    },
    [setNodes, setSelectedTool],
  );

  const handleCanvasDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-background grid-background"
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 50, y: 50, zoom: 1 }}
      >
        <Controls className="bg-card border border-border" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--grid-color))"
        />
      </ReactFlow>
    </div>
  );
}

function getSubtitleForTool(tool: string): string {
  switch (tool) {
    case "pid-controller":
      return "Kp=1, Ki=0.1, Kd=0.05";
    case "transfer-function":
      return "1/(s+1)";
    case "gain-block":
      return "K=1.0";
    case "step-input":
      return "Amp=1.0";
    case "sine-wave":
      return "f=1Hz";
    default:
      return "";
  }
}

function getBlockTypeFromLabel(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function getPropertiesFromSubtitle(subtitle: string): any {
  if (!subtitle) return {};

  if (subtitle.includes("Kp=")) {
    // Parse PID parameters
    const kpMatch = subtitle.match(/Kp=([0-9.]+)/);
    const kiMatch = subtitle.match(/Ki=([0-9.]+)/);
    const kdMatch = subtitle.match(/Kd=([0-9.]+)/);

    return {
      kp: kpMatch ? parseFloat(kpMatch[1]) : 1,
      ki: kiMatch ? parseFloat(kiMatch[1]) : 0.1,
      kd: kdMatch ? parseFloat(kdMatch[1]) : 0.05,
    };
  }

  if (subtitle.includes("/(") && subtitle.includes(")")) {
    // Parse transfer function
    const parts = subtitle.split("/");
    if (parts.length === 2) {
      const numerator = parts[0].trim();
      const denominator = parts[1].replace(/[()]/g, "").trim();

      return {
        numerator: [numerator],
        denominator: denominator.split("+").map((s) => s.trim()),
      };
    }
  }

  if (subtitle.includes("K=")) {
    // Parse gain
    const gainMatch = subtitle.match(/K=([0-9.]+)/);
    return {
      gain: gainMatch ? parseFloat(gainMatch[1]) : 1,
    };
  }

  if (subtitle.includes("Amp=")) {
    // Parse amplitude
    const ampMatch = subtitle.match(/Amp=([0-9.]+)/);
    return {
      amplitude: ampMatch ? parseFloat(ampMatch[1]) : 1,
    };
  }

  if (subtitle.includes("f=")) {
    // Parse frequency
    const freqMatch = subtitle.match(/f=([0-9.]+)/);
    return {
      frequency: freqMatch ? parseFloat(freqMatch[1]) : 1,
    };
  }

  return {};
}
