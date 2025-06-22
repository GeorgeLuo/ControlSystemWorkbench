export function getSubtitleForTool(tool: string): string {
  switch (tool) {
    case "pid-controller":
      return "Kp=1, Ki=0.1, Kd=0.05";
    case "transfer-function":
      return "1/(s+1)";
    case "gain-block":
      return "K=1.0";
    case "step-input":
      return "Amp=1.0";
    case "sine-wave":
      return "f=1Hz";
    default:
      return "";
  }
}

export function getBlockTypeFromLabel(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

export function getPropertiesFromSubtitle(subtitle: string): any {
  if (!subtitle) return {};

  if (subtitle.includes("Kp=")) {
    const kpMatch = subtitle.match(/Kp=([0-9.]+)/);
    const kiMatch = subtitle.match(/Ki=([0-9.]+)/);
    const kdMatch = subtitle.match(/Kd=([0-9.]+)/);

    return {
      kp: kpMatch ? parseFloat(kpMatch[1]) : 1,
      ki: kiMatch ? parseFloat(kiMatch[1]) : 0.1,
      kd: kdMatch ? parseFloat(kdMatch[1]) : 0.05,
    };
  }

  if (subtitle.includes("/(") && subtitle.includes(")")) {
    const parts = subtitle.split("/");
    if (parts.length === 2) {
      const numerator = parts[0].trim();
      const denominator = parts[1].replace(/[()]/g, "").trim();

      return {
        numerator: [numerator],
        denominator: denominator.split("+").map((s) => s.trim()),
      };
    }
  }

  if (subtitle.includes("K=")) {
    const gainMatch = subtitle.match(/K=([0-9.]+)/);
    return {
      gain: gainMatch ? parseFloat(gainMatch[1]) : 1,
    };
  }

  if (subtitle.includes("Amp=")) {
    const ampMatch = subtitle.match(/Amp=([0-9.]+)/);
    return {
      amplitude: ampMatch ? parseFloat(ampMatch[1]) : 1,
    };
  }

  if (subtitle.includes("f=")) {
    const freqMatch = subtitle.match(/f=([0-9.]+)/);
    return {
      frequency: freqMatch ? parseFloat(freqMatch[1]) : 1,
    };
  }

  return {};
}
