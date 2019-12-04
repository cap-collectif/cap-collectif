// @flow
/* eslint-env jest */
import { formatBigNumber } from '~/utils/bigNumberFormatter';

describe('validateResponses', () => {
  it('Should not format too short number', () => {
    const value = formatBigNumber(19);
    expect(value).toEqual('19');
  });

  it('Should format big number', () => {
    const value = formatBigNumber(1000);
    expect(value).toEqual('1 000');
  });

  it('Should format huge number', () => {
    const value = formatBigNumber(123456789);
    expect(value).toEqual('123 456 789');
  });
});
