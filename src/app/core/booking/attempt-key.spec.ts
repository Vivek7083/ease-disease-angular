import { AttemptKey } from './attempt-key';

describe('AttemptKey', () => {
  let counter: number;
  let keys: AttemptKey;

  beforeEach(() => {
    counter = 0;
    keys = new AttemptKey(() => `key-${++counter}`);
  });

  it('gives the same key to an identical request, so a retry cannot create a second booking', () => {
    expect(keys.keyFor({ name: 'Priya' })).toBe('key-1');
    expect(keys.keyFor({ name: 'Priya' })).toBe('key-1');
  });

  it('gives a new key as soon as anything in the request changes', () => {
    expect(keys.keyFor({ name: 'Priya', age: 34 })).toBe('key-1');
    expect(keys.keyFor({ name: 'Priya', age: 35 })).toBe('key-2');
  });

  it('a change and a change back is a new key, not the old one', () => {
    keys.keyFor({ a: 1 });
    keys.keyFor({ a: 2 });
    expect(keys.keyFor({ a: 1 })).toBe('key-3');
  });

  it('renew forgets the key, even for an identical request', () => {
    keys.keyFor({ a: 1 });
    keys.renew();
    expect(keys.keyFor({ a: 1 })).toBe('key-2');
  });
});
