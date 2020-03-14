import ExamplePlugin from '../src';

describe('Example Plugin', () => {
  expect(() => new ExamplePlugin()).not.toThrow();
});
