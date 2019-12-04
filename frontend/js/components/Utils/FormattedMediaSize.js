// @flow
import * as React from 'react';

const FormattedMediaSize = ({ size }: { size: number }) => {
  let newSize;

  if (size / 1000 < 1000) {
    newSize = `${Math.round(size / 1000)} Ko`;
  } else if (size / 1000000 < 1000) {
    newSize = `${Math.round(size / 1000000)} Mo`;
  } else {
    newSize = `${Math.round(size / 1000000000)} Go`;
  }

  return <span>{newSize}</span>;
};

export default FormattedMediaSize;
