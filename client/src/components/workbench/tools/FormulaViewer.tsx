import { useWorkbenchStore } from "@/store/workbench";
import { BlockTypes } from "@/constants/blockTypes";

export default function FormulaViewer() {
  const { blocks, connections } = useWorkbenchStore();

  // Generate formula representation based on connected blocks
  const generateFormula = () => {
    if (blocks.length === 0) {
      return "No blocks in system";
    }

    if (connections.length === 0) {
      const blockList = blocks
        .map((block) => `${block.data?.label || block.type} (${block.id})`)
        .join(", ");
      return `Blocks present: ${blockList}. Connect them to form a control system.`;
    }

    // Find the main control loop blocks
    const pidBlock = blocks.find((block) => block.type === BlockTypes.PID_CONTROLLER);
    const plantBlock = blocks.find(
      (block) => block.type === BlockTypes.TRANSFER_FUNCTION || block.type === BlockTypes.PLANT_MODEL,
    );
    const gainBlock = blocks.find((block) => block.type === BlockTypes.GAIN_BLOCK);
    const inputBlock = blocks.find(
      (block) => block.type === BlockTypes.STEP_INPUT || block.type === BlockTypes.SINE_WAVE,
    );
    const sensorBlock = blocks.find((block) => block.type === BlockTypes.SENSOR);

    // Check if PID and plant are actually connected
    const pidToPlantConnection = pidBlock && plantBlock && 
      connections.some(conn => 
        (conn.source === pidBlock.id && conn.target === plantBlock.id) ||
        (conn.source === plantBlock.id && conn.target === pidBlock.id)
      );

    // Check for feedback loop (sensor connected back to summing junction)
    const hasFeedbackLoop = sensorBlock && 
      connections.some(conn => conn.source === sensorBlock.id);

    if (pidBlock && plantBlock && pidToPlantConnection) {
      // Get actual PID parameters from block properties
      const kp = pidBlock.data?.properties?.kp || 1;
      const ki = pidBlock.data?.properties?.ki || 0.1;
      const kd = pidBlock.data?.properties?.kd || 0.05;

      const pidFormula = `${kp} + \\frac{${ki}}{s} + ${kd} s`;

      // Get actual plant parameters
      const numerator = plantBlock.data?.properties?.numerator || ["1"];
      const denominator = plantBlock.data?.properties?.denominator || [
        "s",
        "1",
      ];
      const plantFormula = `\\frac{${numerator.join(" + ")}}{${denominator.join(" + ")}}`;

      const systemType = hasFeedbackLoop ? "Closed Loop" : "Open Loop";
      
      return {
        openLoop: `G_c(s) \\cdot G_p(s) = (${pidFormula}) \\cdot (${plantFormula})`,
        closedLoop: hasFeedbackLoop ? `\\frac{G_c(s) \\cdot G_p(s)}{1 + G_c(s) \\cdot G_p(s)}` : undefined,
        pid: `G_c(s) = ${pidFormula}`,
        plant: `G_p(s) = ${plantFormula}`,
        systemType,
      };
    }

    // Check if individual blocks have connections
    const connectedBlocks = new Set(
      connections.flatMap(conn => [conn.source, conn.target])
    );

    if (plantBlock && connectedBlocks.has(plantBlock.id)) {
      const numerator = plantBlock.data?.properties?.numerator || ["1"];
      const denominator = plantBlock.data?.properties?.denominator || [
        "s",
        "1",
      ];
      const plantFormula = `\\frac{${numerator.join(" + ")}}{${denominator.join(" + ")}}`;

      return {
        system: `G(s) = ${plantFormula}`,
        plant: `G_p(s) = ${plantFormula}`,
      };
    }

    if (gainBlock && connectedBlocks.has(gainBlock.id)) {
      const gain = gainBlock.data?.properties?.gain || 1;
      return {
        system: `G(s) = ${gain}`,
        gain: `K = ${gain}`,
      };
    }

    // Show information about individual blocks if no meaningful connections exist
    const blockList = blocks
      .map((block) => `${block.data?.label || block.type} (${block.id})`)
      .join(", ");
    return `Blocks present: ${blockList}. Connect them to form a control system.`;
  };

  const formulas = generateFormula();

  const renderFormula = (latex: string) => {
    // Simple LaTeX-like rendering for basic formulas
    return latex
      .replace(
        /\\frac{([^}]+)}{([^}]+)}/g,
        '<div class="fraction"><div class="numerator">$1</div><div class="denominator">$2</div></div>',
      )
      .replace(/K_p/g, "K<sub>p</sub>")
      .replace(/K_i/g, "K<sub>i</sub>")
      .replace(/K_d/g, "K<sub>d</sub>")
      .replace(/G_c/g, "G<sub>c</sub>")
      .replace(/G_p/g, "G<sub>p</sub>")
      .replace(/\\cdot/g, " × ");
  };

  return (
    <div className="p-4 h-full">
      <div className="bg-card border border-border rounded h-full overflow-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Control System Formulas
          </h3>

          {typeof formulas === "string" ? (
            <div className="text-muted-foreground text-center py-8">
              {formulas}
            </div>
          ) : (
            <div className="space-y-6">
              {formulas.pid && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">
                    PID Controller
                  </h4>
                  <div
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{
                      __html: renderFormula(formulas.pid),
                    }}
                  />
                </div>
              )}

              {formulas.plant && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">
                    Plant Model
                  </h4>
                  <div
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{
                      __html: renderFormula(formulas.plant),
                    }}
                  />
                </div>
              )}

              {formulas.openLoop && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">
                    Open Loop Transfer Function
                  </h4>
                  <div
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{
                      __html: renderFormula(formulas.openLoop),
                    }}
                  />
                </div>
              )}

              {formulas.closedLoop && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">
                    Closed Loop Transfer Function
                  </h4>
                  <div
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{
                      __html: renderFormula(formulas.closedLoop),
                    }}
                  />
                </div>
              )}

              {formulas.system && (
                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="font-medium text-foreground mb-2">
                    System Transfer Function
                  </h4>
                  <div
                    className="formula-display text-foreground font-mono text-lg"
                    dangerouslySetInnerHTML={{
                      __html: renderFormula(formulas.system),
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
            <p className="text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Formulas are automatically generated based
              on connected blocks in your control system diagram.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
