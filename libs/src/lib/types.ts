export type Item = {
  id: number;
  description: string;
}

export type ItemsResponse = {
  leftItems: ParentItem[],
  rightItems: Item[],
}

export interface ParentItem extends Item {
  predecessors: Item[];
  isExpanded: boolean;
}

export type HistoryStep = {
  parentIdx: number;
  childId: number;
}
