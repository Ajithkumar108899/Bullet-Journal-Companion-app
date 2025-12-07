import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionEngine } from './conversion-engine';

describe('ConversionEngine', () => {
  let component: ConversionEngine;
  let fixture: ComponentFixture<ConversionEngine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversionEngine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversionEngine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
