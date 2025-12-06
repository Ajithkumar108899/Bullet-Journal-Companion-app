import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanDoc } from './scan-doc';

describe('ScanDoc', () => {
  let component: ScanDoc;
  let fixture: ComponentFixture<ScanDoc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanDoc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanDoc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
