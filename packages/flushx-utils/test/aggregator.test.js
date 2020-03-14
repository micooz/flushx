import { Aggregator } from '../src/aggregator';

describe('Aggregator#aggregateBy', () => {
  test('no return key', () => {
    const aggregator = new Aggregator();
    aggregator.aggregateBy([ 1, 2, 3 ], () => undefined);
    expect(aggregator.dataMap).toMatchSnapshot();
  });

  test('normal case', () => {
    const aggregator = new Aggregator();
    aggregator.aggregateBy([ 1, 2, 3 ], () => 1);
    aggregator.aggregateBy([ 1, 2, 3 ], () => 2);
    expect(aggregator.dataMap).toMatchSnapshot();
  });
});

describe('Aggregator#dispose', () => {
  test('dispose', () => {
    const aggregator = new Aggregator();
    aggregator.aggregateBy([ 1, 2, 3 ], () => 1);

    expect(aggregator.dataMap.size).toBe(1);
    aggregator.dispose();

    expect(aggregator.dataMap.size).toBe(0);
  });
});
