import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkbenchStore } from '@/store/workbench';
import { 
  Calculator, 
  Parentheses, 
  ArrowRightLeft, 
  StepForward, 
  Waves, 
  TrendingUp, 
  BarChart3,
  Search,
  Plus,
  FolderOpen,
  Function
} from 'lucide-react';
import { cn } from '@/lib/utils';

const toolCategories = [
  {
    name: 'Control Blocks',
    tools: [
      { id: 'pid-controller', name: 'PID Controller', icon: Calculator, color: 'text-primary bg-primary/10' },
      { id: 'transfer-function', name: 'Transfer Parentheses', icon: Parentheses, color: 'text-green-600 bg-green-100' },
      { id: 'gain-block', name: 'Gain Block', icon: ArrowRightLeft, color: 'text-purple-600 bg-purple-100' },
    ]
  },
  {
    name: 'Signal Sources',
    tools: [
      { id: 'step-input', name: 'Step Input', icon: StepForward, color: 'text-orange-600 bg-orange-100' },
      { id: 'sine-wave', name: 'Sine Wave', icon: Waves, color: 'text-red-600 bg-red-100' },
    ]
  },
  {
    name: 'Analysis Tools',
    tools: [
      { id: 'scope', name: 'Oscilloscope', icon: TrendingUp, color: 'text-teal-600 bg-teal-100' },
      { id: 'bode-plot', name: 'Bode Plot', icon: BarChart3, color: 'text-indigo-600 bg-indigo-100' },
      { id: 'formula-viewer', name: 'Formula Viewer', icon: Function, color: 'text-blue-600 bg-blue-100' },
    ]
  }
];

export default function SidebarPanel() {
  const { sidebarExpanded, selectedTool, setSelectedTool, addBlock, openWindow } = useWorkbenchStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleToolClick = (toolId: string) => {
    setSelectedTool(selectedTool === toolId ? null : toolId);
  };

  const handleToolDrag = (toolId: string, event: React.DragEvent) => {
    event.dataTransfer.setData('tool', toolId);
  };

  const handleAnalysisToolClick = (toolId: string) => {
    if (toolId === 'scope') {
      openWindow('oscilloscope', 'Oscilloscope');
    } else if (toolId === 'bode-plot') {
      openWindow('bode-plot', 'Bode Plot');
    } else if (toolId === 'formula-viewer') {
        openWindow('formula-viewer', 'Formula Viewer');
    }
  };

  const filteredCategories = toolCategories.map(category => ({
    ...category,
    tools: category.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0);

  return (
    <div className={cn(
      "bg-card border-r border-border sidebar-transition relative z-40 overflow-hidden",
      sidebarExpanded ? "w-72" : "w-0"
    )}>
      <div className="w-72 h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground mb-3">Toolbox</h2>

          {/* Search Tools */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Tool Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {category.name}
              </h3>
              <div className="space-y-1">
                {category.tools.map((tool) => {
                  const Icon = tool.icon;
                  const isSelected = selectedTool === tool.id;
                  const isAnalysisTool = category.name === 'Analysis Tools';

                  return (
                    <div
                      key={tool.id}
                      className={cn(
                        "tool-item",
                        isSelected && "tool-item-active"
                      )}
                      onClick={() => isAnalysisTool ? handleAnalysisToolClick(tool.id) : handleToolClick(tool.id)}
                      draggable={!isAnalysisTool}
                      onDragStart={(e) => !isAnalysisTool && handleToolDrag(tool.id, e)}
                    >
                      <div className={cn("w-8 h-8 rounded flex items-center justify-center mr-3", tool.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-foreground">{tool.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Button className="w-full workbench-button workbench-button-accent">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>

          <Button variant="outline" className="w-full">
            <FolderOpen className="h-4 w-4 mr-2" />
            Open Project
          </Button>
        </div>
      </div>
    </div>
  );
}