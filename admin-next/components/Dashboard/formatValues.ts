import type { IntlShape } from 'react-intl';
import moment from 'moment';

type Value = {
    readonly key: string,
    readonly totalCount: number,
};

type ValueFormatted = {
    date: string,
    value: number,
};

const formatValues = (values: ReadonlyArray<Value> | Value[], intl: IntlShape): ValueFormatted[] =>
    values.map(value => ({
        date: intl.formatDate(moment(value.key).toDate(), {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }),
        value: value.totalCount,
    }));

export default formatValues;
