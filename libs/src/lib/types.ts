export type Item = {
  id: number;
  description: string;
}

export type ItemsResponse = {
  leftItems: ParentItem[],
  rightItems: Item[],
}

export interface ParentItem extends Item {
  predecessors: number[];
  isExpanded: boolean;
}

export type HistoryStep = {
  parent: number | undefined;
  child: number | undefined;
}
