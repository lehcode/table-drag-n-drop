import { Injectable } from '@nestjs/common';
import { Faker, he, en, base } from '@faker-js/faker';
import { Item, ItemsResponse } from 'types';

const baseArr = new Array(5).fill(null);
const customFaker = new Faker({locale: [he, en, base]});

@Injectable()
export class AppService {
  private leftItems: Item[] = baseArr.map((_, idx) => ({
    id: idx + 1,
    description: customFaker.lorem.words({min: 1, max: 3}),
  }));

  private rightItems: Item[] = baseArr.map((_, idx) => ({
    id: idx + 1 + baseArr.length,
    description: customFaker.lorem.words({min: 1, max: 3}),
  }));

  private attachedIds: number[] = [];

  getItems(): ItemsResponse {
    return {
      leftItems: this.leftItems,
      rightItems: this.rightItems,
      attachedIds: this.attachedIds,
    };
  }

  saveAttachedIds(ids: number[]): { success: boolean } {
    this.attachedIds = ids;
    return { success: true };
  }
}
