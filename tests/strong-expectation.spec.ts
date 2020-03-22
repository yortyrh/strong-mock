import { expect } from 'tdd-buffet/expect/jest';
import { describe, it } from 'tdd-buffet/suite/node';
import { Matcher } from '../src/matcher';
import { StrongExpectation } from '../src/strong-expectation';
import { expectAnsilessEqual } from './ansiless';

describe('StrongExpectation', () => {
  it('should match same prop', () => {
    const expectation = new StrongExpectation('bar', [], undefined);

    expect(expectation.matches('baz', [])).toBeFalsy();
  });

  it('should match empty args', () => {
    const expectation = new StrongExpectation('bar', [], undefined);

    expect(expectation.matches('bar', [])).toBeTruthy();
  });

  it('should match no args', () => {
    const expectation = new StrongExpectation('bar', undefined, undefined);

    expect(expectation.matches('bar', undefined)).toBeTruthy();
    expect(expectation.matches('bar', [1])).toBeFalsy();
  });

  it('should match primitives', () => {
    const expectation = new StrongExpectation('bar', [1, '2', true], undefined);

    expect(expectation.matches('bar', [1, '2', true])).toBeTruthy();
    expect(expectation.matches('bar', [2, '2', true])).toBeFalsy();
    expect(expectation.matches('bar', [1, '3', true])).toBeFalsy();
    expect(expectation.matches('bar', [1, '2', false])).toBeFalsy();
  });

  it('should match objects', () => {
    const expectation = new StrongExpectation(
      'bar',
      [
        {
          bar: { baz: 42 }
        }
      ],
      undefined
    );

    expect(
      expectation.matches('bar', [
        {
          bar: { baz: 42 }
        }
      ])
    ).toBeTruthy();
  });

  it('should match arrays', () => {
    const expectation = new StrongExpectation('bar', [[1, 2, 3]], 23);

    expect(expectation.matches('bar', [[1, 2, 3]])).toBeTruthy();
  });

  it('should match deep arrays', () => {
    const expectation = new StrongExpectation('bar', [[1, 2, [3, 4]]], 23);

    expect(expectation.matches('bar', [[1, 2, [3, 4]]])).toBeTruthy();
  });

  it('should match sets', () => {
    const expectation = new StrongExpectation('bar', [new Set([1, 2, 3])], 23);

    expect(expectation.matches('bar', [new Set([1, 2, 3])])).toBeTruthy();
  });

  it('should match maps', () => {
    const expectation = new StrongExpectation(
      'bar',
      [
        new Map([
          [1, true],
          [2, false]
        ])
      ],
      23
    );

    expect(
      expectation.matches('bar', [
        new Map([
          [1, true],
          [2, false]
        ])
      ])
    ).toBeTruthy();
  });

  it('should match optional args against undefined', () => {
    const expectation = new StrongExpectation('bar', [undefined], 23);

    expect(expectation.matches('bar', [])).toBeTruthy();
  });

  it('should match passed in optional args', () => {
    const expectation = new StrongExpectation('bar', [], 23);

    expect(expectation.matches('bar', [42])).toBeTruthy();
  });

  it('should not match missing expected optional arg', () => {
    const expectation = new StrongExpectation('bar', [23], 23);

    expect(expectation.matches('bar', [])).toBeFalsy();
  });

  it('should not match defined expected undefined optional arg', () => {
    const expectation = new StrongExpectation('bar', [undefined], 23);

    expect(expectation.matches('bar', [42])).toBeFalsy();
  });

  it('should call matchers', () => {
    let matchesCalledWith;

    const spyMatcher: Matcher<any> = {
      __isMatcher: true,
      matches: (arg: any) => {
        matchesCalledWith = arg;
        return true;
      }
    };

    const expectation = new StrongExpectation('bar', [spyMatcher], 23);

    expect(expectation.matches('bar', [23])).toBeTruthy();
    expect(matchesCalledWith).toEqual(23);
  });

  it('should print when, returns and invocation count', () => {
    const expectation = new StrongExpectation('baz', [4, 5, 6], 42);
    expectation.setInvocationCount(2, 3);

    expectAnsilessEqual(
      expectation.toJSON(),
      `when(mock.baz(4, 5, 6)).thenReturn(42).between(2, 3)`
    );
  });

  it('should by default match only once', () => {
    const expectation = new StrongExpectation('bar', [], undefined);

    expect(expectation.matches('bar', [])).toBeTruthy();
    expect(expectation.matches('bar', [])).toBeFalsy();
  });

  it('should match at most max times', () => {
    const expectation = new StrongExpectation('bar', [], undefined);
    expectation.setInvocationCount(1, 2);

    expect(expectation.matches('bar', [])).toBeTruthy();
    expect(expectation.matches('bar', [])).toBeTruthy();
    expect(expectation.matches('bar', [])).toBeFalsy();
  });

  it('should match forever', () => {
    const expectation = new StrongExpectation('bar', [], undefined);
    expectation.setInvocationCount(0, 0);

    expect(expectation.matches('bar', [])).toBeTruthy();
    expect(expectation.matches('bar', [])).toBeTruthy();
  });

  it('should by default be unmet', () => {
    const expectation = new StrongExpectation('bar', [], undefined);

    expect(expectation.isUnmet()).toBeTruthy();
  });

  it('should by met if min is 0', () => {
    const expectation = new StrongExpectation('bar', [], undefined);
    expectation.setInvocationCount(0);

    expect(expectation.isUnmet()).toBeFalsy();
  });

  it('should become met if min is satisfied', () => {
    const expectation = new StrongExpectation('bar', [], undefined);
    expectation.setInvocationCount(1);

    expectation.matches('bar', []);
    expect(expectation.isUnmet()).toBeFalsy();
  });

  it('should remain unmet until min is satisfied', () => {
    const expectation = new StrongExpectation('bar', [], undefined);
    expectation.setInvocationCount(2);

    expectation.matches('bar', []);
    expect(expectation.isUnmet()).toBeTruthy();
  });
});
