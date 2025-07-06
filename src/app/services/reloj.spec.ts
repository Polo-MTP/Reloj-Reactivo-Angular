import { TestBed } from '@angular/core/testing';

import { Reloj } from './reloj';

describe('Reloj', () => {
  let service: Reloj;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reloj);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
