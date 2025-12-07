import { TestBed } from '@angular/core/testing';

import { ConversionEngineService } from './conversion-engine.service';

describe('ConversionEngineService', () => {
  let service: ConversionEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversionEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
