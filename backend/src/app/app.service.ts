import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private leftItems = [
    { id: '1', description: 'Item 1' },
    { id: '2', description: 'Item 2' },
    // Add more items as needed
  ];

  private rightItems = [
    { id: '3', description: 'Item 3' },
    { id: '4', description: 'Item 4' },
    // Add more items as needed
  ];

  private attachedIds: string[] = [];

  getItems() {
    return {
      leftItems: this.leftItems,
      rightItems: this.rightItems,
      attachedIds: this.attachedIds,
    };
  }

  saveAttachedIds(ids: string[]) {
    this.attachedIds = ids;
    return { success: true };
  }
}