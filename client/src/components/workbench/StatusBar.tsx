import { useWorkbenchStore } from '@/store/workbench';

export default function StatusBar() {
  const { canvasZoom, selectedBlocks, projectName, lastSaved } = useWorkbenchStore();

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never saved';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins === 0) return 'Just saved';
    if (diffMins === 1) return '1 minute ago';
    return `${diffMins} minutes ago`;
  };

  const getCpuUsage = () => {
    // Simulate CPU usage for demo
    return Math.floor(Math.random() * 20) + 8;
  };

  return (
    <div className="bg-surface border-t border-border px-4 py-1 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center space-x-4">
        <span>Zoom: {Math.round(canvasZoom)}%</span>
        <span>
          Selected: {selectedBlocks.length} {selectedBlocks.length === 1 ? 'block' : 'blocks'}
        </span>
        <span className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          Ready
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span>Last saved: {formatLastSaved(lastSaved)}</span>
        <span>CPU: {getCpuUsage()}%</span>
      </div>
    </div>
  );
}
