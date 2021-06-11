// @flow
import type { IntlShape } from 'react-intl';
import moment from 'moment';

type Value = {|
  +key: string,
  +totalCount: number,
|};

type ValueFormatted = {|
  +date: string,
  +value: number,
|};

const formatValues = (values: $ReadOnlyArray<Value>, intl: IntlShape): ValueFormatted[] =>
  values.map(value => ({
    date: intl.formatDate(moment(value.key), {
      day: 'numeric',
      month: 'short',
    }),
    value: value.totalCount,
  }));

export default formatValues;
