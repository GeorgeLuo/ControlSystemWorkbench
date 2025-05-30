import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useWorkbenchStore } from '@/store/workbench';

export default function PropertiesPanel() {
  const { selectedBlocks } = useWorkbenchStore();
  const [properties, setProperties] = useState({
    kp: '1.0',
    ki: '0.1',
    kd: '0.05',
    sampleTime: '0.01',
    showParameters: true,
    enableSaturation: false,
  });

  const handlePropertyChange = (key: string, value: string | boolean) => {
    setProperties(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyChanges = () => {
    // TODO: Apply changes to selected blocks
    console.log('Applying changes:', properties);
  };

  const hasSelection = selectedBlocks.length > 0;
  const selectedBlockType = hasSelection ? 'PID Controller' : null;

  return (
    <div className="p-4 h-full overflow-y-auto space-y-4">
      {hasSelection ? (
        <>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">
              Selected Block: {selectedBlockType}
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="kp" className="text-xs font-medium text-muted-foreground">
                  Proportional Gain (Kp)
                </Label>
                <Input
                  id="kp"
                  type="number"
                  value={properties.kp}
                  onChange={(e) => handlePropertyChange('kp', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="ki" className="text-xs font-medium text-muted-foreground">
                  Integral Gain (Ki)
                </Label>
                <Input
                  id="ki"
                  type="number"
                  value={properties.ki}
                  onChange={(e) => handlePropertyChange('ki', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="kd" className="text-xs font-medium text-muted-foreground">
                  Derivative Gain (Kd)
                </Label>
                <Input
                  id="kd"
                  type="number"
                  value={properties.kd}
                  onChange={(e) => handlePropertyChange('kd', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="sampleTime" className="text-xs font-medium text-muted-foreground">
                  Sample Time
                </Label>
                <Input
                  id="sampleTime"
                  type="number"
                  value={properties.sampleTime}
                  onChange={(e) => handlePropertyChange('sampleTime', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Display Options</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showParameters"
                  checked={properties.showParameters}
                  onCheckedChange={(checked) => handlePropertyChange('showParameters', !!checked)}
                />
                <Label htmlFor="showParameters" className="text-sm text-foreground">
                  Show parameter values
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableSaturation"
                  checked={properties.enableSaturation}
                  onCheckedChange={(checked) => handlePropertyChange('enableSaturation', !!checked)}
                />
                <Label htmlFor="enableSaturation" className="text-sm text-foreground">
                  Enable saturation limits
                </Label>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-4">
            <Button 
              onClick={handleApplyChanges}
              className="w-full workbench-button workbench-button-primary"
            >
              Apply Changes
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <div className="text-sm">No block selected</div>
            <div className="text-xs mt-1">Select a block to view its properties</div>
          </div>
        </div>
      )}
    </div>
  );
}
