export type Item = {
  id: number;
  description: string;
}

export type ItemsResponse = {
  leftItems: Item[],
  rightItems: Item[],
  attachedIds: number[]
}

export interface ExtendedItem extends Item {
  children?: number[];
  isExpanded?: boolean;
}
