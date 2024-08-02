import { Test } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getItems', () => {
    it('should return correct object when leftItems, rightItems, and predecessors have values', () => {
    const expectedResult = {
      leftItems: [
        { id: '1', description: 'Item 1' },
        { id: '2', description: 'Item 2' },
      ],
      rightItems: [
        { id: '3', description: 'Item 3' },
        { id: '4', description: 'Item 4' },
      ],
      predecessors: [],
    };
    expect(service.getItems()).toEqual(expectedResult);
  });
  });
});
