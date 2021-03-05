// @flow
import * as React from 'react';

type Props = {|
  +number: number,
|};

// Nice tool to have the 10K  or 2.4M number format
export const FormattedNumber = ({ number }: Props) => {
  let formattedNumber = 0;
  if (number <= 999) {
    formattedNumber = number;
  } else if (number < 1000000) {
    formattedNumber = `${Number((number / 1000).toFixed(1))}K`.replace('.', ',');
  } else if (number >= 1000000) {
    formattedNumber = `${Number((number / 1000000).toFixed(1))}M`.replace('.', ',');
  }

  return <>{formattedNumber}</>;
};

export default FormattedNumber;
