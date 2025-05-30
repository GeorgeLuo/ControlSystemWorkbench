
import { useWorkbenchStore } from '@/store/workbench';

export default function FormulaViewer() {
  const { blocks, connections } = useWorkbenchStore();

  // Generate formula representation based on connected blocks
  const generateFormula = () => {
    if (blocks.length === 0) {
      return "No blocks in system";
    }

    // Find the main control loop
    const pidBlock = blocks.find(block => block.type === 'pid-controller');
    const plantBlock = blocks.find(block => block.type === 'transfer-function');
    const inputBlock = blocks.find(block => block.type === 'step-input' || block.type === 'sine-wave');

    if (pidBlock && plantBlock) {
      const pidFormula = "K_p + \\frac{K_i}{s} + K_d s";
      const plantFormula = "\\frac{" + (plantBlock.data?.properties?.numerator?.join('s + ') || "1") + "}{" + 
                          (plantBlock.data?.properties?.denominator?.join('s + ') || "s + 1") + "}";
      
      return {
        openLoop: `G_c(s) \\cdot G_p(s) = (${pidFormula}) \\cdot (${plantFormula})`,
        closedLoop: `\\frac{G_c(s) \\cdot G_p(s)}{1 + G_c(s) \\cdot G_p(s)}`,
        pid: `G_c(s) = ${pidFormula}`,
        plant: `G_p(s) = ${plantFormula}`
      };
    }

    if (plantBlock) {
      const plantFormula = "\\frac{" + (plantBlock.data?.properties?.numerator?.join('s + ') || "1") + "}{" + 
                          (plantBlock.data?.properties?.denominator?.join('s + ') || "s + 1") + "}";
      return {
        system: `G(s) = ${plantFormula}`,
        plant: `G_p(s) = ${plantFormula}`
      };
    }

    return "Connect blocks to see system formulas";
  };

  const formulas = generateFormula();

  const renderFormula = (latex: string) => {
    // Simple LaTeX-like rendering for basic formulas
    return latex
      .replace(/\\frac{([^}]+)}{([^}]+)}/g, '<div class="fraction"><div class="numerator">$1</div><div class="denominator">$2</div></div>')
      .replace(/K_p/g, 'K<sub>p</sub>')
      .replace(/K_i/g, 'K<sub>i</sub>')
      .replace(/K_d/g, 'K<sub>d</sub>')
      .replace(/G_c/g, 'G<sub>c</sub>')
      .replace(/G_p/g, 'G<sub>p</sub>')
      .replace(/\\cdot/g, ' × ');
  };

  return (
    <div className="p-4 h-full">
      <div className="bg-card border border-border rounded h-full overflow-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Control System Formulas</h3>
          
          {typeof formulas === 'string' ? (
            <div className="text-muted-foreground text-center py-8">
              {formulas}
            </div>
          ) : (
            <div className="space-y-6">
              {formulas.pid && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">PID Controller</h4>
                  <div 
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{ __html: renderFormula(formulas.pid) }}
                  />
                </div>
              )}
              
              {formulas.plant && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">Plant Model</h4>
                  <div 
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{ __html: renderFormula(formulas.plant) }}
                  />
                </div>
              )}
              
              {formulas.openLoop && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">Open Loop Transfer Function</h4>
                  <div 
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{ __html: renderFormula(formulas.openLoop) }}
                  />
                </div>
              )}
              
              {formulas.closedLoop && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">Closed Loop Transfer Function</h4>
                  <div 
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{ __html: renderFormula(formulas.closedLoop) }}
                  />
                </div>
              )}
              
              {formulas.system && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">System Transfer Function</h4>
                  <div 
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{ __html: renderFormula(formulas.system) }}
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
            <p className="text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Formulas are automatically generated based on connected blocks in your control system diagram.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
