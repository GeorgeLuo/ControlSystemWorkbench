import { useCallback, useRef } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkbenchStore } from '@/store/workbench';

// Custom node component
function ControlBlock({ data }: { data: any }) {
  return (
    <div className="bg-surface border-2 border-border rounded-lg shadow-sm p-3 min-w-[120px] select-none">
      <div className="text-xs font-medium text-foreground text-center">{data.label}</div>
      {data.subtitle && (
        <div className="text-xs text-muted-foreground text-center mt-1">{data.subtitle}</div>
      )}
      
      {/* Input handle */}
      <div 
        className="absolute left-0 top-1/2 w-3 h-3 bg-primary border-2 border-surface rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ position: 'absolute' }}
      />
      
      {/* Output handle */}
      <div 
        className="absolute right-0 top-1/2 w-3 h-3 bg-primary border-2 border-surface rounded-full transform translate-x-1/2 -translate-y-1/2"
        style={{ position: 'absolute' }}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  controlBlock: ControlBlock,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'controlBlock',
    position: { x: 200, y: 150 },
    data: { 
      label: 'PID Controller',
      subtitle: 'Kp=1, Ki=0.1, Kd=0.05'
    },
  },
  {
    id: '2',
    type: 'controlBlock',
    position: { x: 400, y: 150 },
    data: { 
      label: 'Plant Model',
      subtitle: '1/(s²+2s+1)'
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.Arrow,
      color: 'hsl(var(--primary))',
    },
    style: {
      stroke: 'hsl(var(--primary))',
      strokeWidth: 2,
    },
  },
];

export default function CanvasWorkspace() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { selectedTool, setSelectedTool, addBlock } = useWorkbenchStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleCanvasDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    const tool = event.dataTransfer.getData('tool');
    if (!tool || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: event.clientX - canvasRect.left - 60, // Center the block
      y: event.clientY - canvasRect.top - 30,
    };

    // Create new node
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'controlBlock',
      position,
      data: {
        label: tool.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        subtitle: getSubtitleForTool(tool),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedTool(null);
  }, [setNodes, setSelectedTool]);

  const handleCanvasDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div 
      ref={canvasRef}
      className="absolute inset-0 bg-background grid-background"
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
      >
        <Controls className="bg-surface border border-border" />
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
    case 'pid-controller':
      return 'Kp=1, Ki=0.1, Kd=0.05';
    case 'transfer-function':
      return '1/(s+1)';
    case 'gain-block':
      return 'K=1.0';
    case 'step-input':
      return 'Amp=1.0';
    case 'sine-wave':
      return 'f=1Hz';
    default:
      return '';
  }
}
