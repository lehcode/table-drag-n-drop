import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';


describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  it('should return an empty array when no items are available', () => {
    const mockAppService = {
      getItems: jest.fn().mockResolvedValue({
        leftItems: [],
        rightItems: [],
        attachedIds: [],
      }),
    };

    const appController = new AppController(mockAppService as unknown as AppService);
    const result = appController.getItems();

    expect(result).resolves.toEqual({
      leftItems: [],
      rightItems: [],
      attachedIds: [],
    });
  });

  
});
