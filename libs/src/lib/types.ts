export type Item = {
  id: number;
  description: string;
}

export type ItemsResponse = {
  leftItems: Item[],
  rightItems: Item[],
  attachedIds: number[]
}
