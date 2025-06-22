export interface BlockProperties {
  [key: string]: number | number[];
}

export interface Block {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    properties: BlockProperties;
  };
}
