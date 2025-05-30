import { Button } from '@/components/ui/button';
import { useWorkbenchStore } from '@/store/workbench';
import { Menu, Save, Settings } from 'lucide-react';

export default function HeaderBar() {
  const { toggleSidebar, projectName, setProjectName } = useWorkbenchStore();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving project...');
  };

  const handleSettings = () => {
    // TODO: Implement settings functionality
    console.log('Opening settings...');
  };

  return (
    <header className="bg-surface border-b border-border h-12 flex items-center justify-between px-4 relative z-50">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="p-2 hover:bg-muted"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Control System Workbench</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground mr-4">{projectName}</span>
        
        <Button
          onClick={handleSave}
          className="workbench-button workbench-button-primary"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSettings}
          className="p-2 hover:bg-muted"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
