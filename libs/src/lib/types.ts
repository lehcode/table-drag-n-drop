export type Item = {
  id: number;
  description: string;
}

export type ItemsResponse = {
  leftItems: ExtendedItem[],
  rightItems: Item[],
  predecessors: number[]
}

export interface ExtendedItem extends Item {
  children: number[];
  isExpanded: boolean;
}
