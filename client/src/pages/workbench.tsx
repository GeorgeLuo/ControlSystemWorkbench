import { useEffect } from 'react';
import HeaderBar from '@/components/workbench/HeaderBar';
import SidebarPanel from '@/components/workbench/SidebarPanel';
import CanvasWorkspace from '@/components/workbench/CanvasWorkspace';
import FloatingWindow from '@/components/workbench/FloatingWindow';
import StatusBar from '@/components/workbench/StatusBar';
import Oscilloscope from '@/components/workbench/tools/Oscilloscope';
import PropertiesPanel from '@/components/workbench/tools/PropertiesPanel';
import { useWorkbenchStore } from '@/store/workbench';

export default function Workbench() {
  const { windows } = useWorkbenchStore();

  useEffect(() => {
    // Set the document title
    document.title = 'Control System Workbench';
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <HeaderBar />
      
      <div className="flex flex-1 relative">
        <SidebarPanel />
        
        <div className="flex-1 relative">
          <CanvasWorkspace />
          
          {/* Render floating windows */}
          {windows.map((window) => (
            <FloatingWindow key={window.id} window={window}>
              {window.type === 'oscilloscope' && <Oscilloscope />}
              {window.type === 'properties' && <PropertiesPanel />}
            </FloatingWindow>
          ))}
        </div>
      </div>
      
      <StatusBar />
    </div>
  );
}
