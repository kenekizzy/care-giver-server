import { Test, TestingModule } from '@nestjs/testing';
import { CaregiversController } from './caregivers.controller';
import { CaregiversService } from './caregivers.service';

describe('CaregiversController', () => {
  let controller: CaregiversController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaregiversController],
      providers: [CaregiversService],
    }).compile();

    controller = module.get<CaregiversController>(CaregiversController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
