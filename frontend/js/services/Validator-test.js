// @flow
/* eslint-env jest */
import { checkOnlyNumbers } from './Validator';

describe('checkOnlyNumbers', () => {
  it('Check all cases possible with numbers', () => {
    expect(checkOnlyNumbers('1')).toEqual(true);
    expect(checkOnlyNumbers('123456')).toEqual(true);
    expect(checkOnlyNumbers('-2')).toEqual(true);
    expect(checkOnlyNumbers('3,4')).toEqual(true);
    expect(checkOnlyNumbers('-5,6')).toEqual(true);
    expect(checkOnlyNumbers('-,7')).toEqual(true);
    expect(checkOnlyNumbers(',8')).toEqual(true);
    expect(checkOnlyNumbers('9,')).toEqual(true);
    expect(checkOnlyNumbers('12,13')).toEqual(true);
    expect(checkOnlyNumbers(',')).toEqual(true);

    expect(checkOnlyNumbers('a')).toEqual(false);
    expect(checkOnlyNumbers('0,,2')).toEqual(false);
    expect(checkOnlyNumbers('-1a')).toEqual(false);
    expect(checkOnlyNumbers('-')).toEqual(false);
  });
});
