import { useCallback, useRef } from 'react';
import { useWorkbenchStore } from '@/store/workbench';

export default function CanvasWorkspace() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { selectedTool, setSelectedTool, openWindow } = useWorkbenchStore();

  const handleCanvasDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    const tool = event.dataTransfer.getData('tool');
    if (!tool || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: event.clientX - canvasRect.left - 60, // Center the block
      y: event.clientY - canvasRect.top - 30,
    };

    // Create new window for the block
    const title = tool.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    openWindow(tool, title, position, { width: 160, height: 120 });
    setSelectedTool(null);
  }, [openWindow, setSelectedTool]);

  const handleCanvasDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div 
      ref={canvasRef}
      className="absolute inset-0 bg-background grid-background"
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
    />
  );
}
