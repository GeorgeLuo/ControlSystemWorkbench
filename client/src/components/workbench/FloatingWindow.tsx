import { useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { useWorkbenchStore, WindowState } from '@/store/workbench';
import { Minus, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingWindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function FloatingWindow({ window, children }: FloatingWindowProps) {
  const rndRef = useRef<Rnd>(null);
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    bringWindowToFront,
  } = useWorkbenchStore();

  const handleDragStart = () => {
    bringWindowToFront(window.id);
  };

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    updateWindowPosition(window.id, { x: data.x, y: data.y });
  };

  const handleResize = (
    e: any,
    direction: any,
    ref: any,
    delta: any,
    position: { x: number; y: number }
  ) => {
    updateWindowSize(window.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    updateWindowPosition(window.id, position);
  };

  if (window.isMaximized) {
    return (
      <div
        className="fixed inset-4 bg-surface rounded-lg window-shadow border border-border overflow-hidden z-50"
        style={{ zIndex: window.zIndex }}
      >
        <WindowHeader window={window} />
        <div className="flex-1 h-[calc(100%-48px)] overflow-hidden">
          {!window.isMinimized && children}
        </div>
      </div>
    );
  }

  return (
    <Rnd
      ref={rndRef}
      size={{ width: window.size.width, height: window.size.height }}
      position={{ x: window.position.x, y: window.position.y }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onResize={handleResize}
      minWidth={200}
      minHeight={100}
      bounds="parent"
      dragHandleClassName="drag-handle"
      className={cn(
        "window bg-surface rounded-lg window-shadow border border-border overflow-hidden",
        window.isMinimized && "h-12"
      )}
      style={{ zIndex: window.zIndex }}
      enableResizing={!window.isMinimized}
    >
      <WindowHeader window={window} />
      <div className="flex-1 h-[calc(100%-48px)] overflow-hidden">
        {!window.isMinimized && children}
      </div>
    </Rnd>
  );
}

function WindowHeader({ window }: { window: WindowState }) {
  const { closeWindow, minimizeWindow, maximizeWindow } = useWorkbenchStore();

  return (
    <div className="drag-handle bg-muted border-b border-border px-4 py-2 flex items-center justify-between h-12">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-foreground">{window.title}</span>
      </div>
      
      <div className="flex items-center space-x-1 window-controls">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => minimizeWindow(window.id)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => maximizeWindow(window.id)}
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 close"
          onClick={() => closeWindow(window.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
