// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Collapsable from '~ui/Collapsable';
import DropdownSelect from '~ui/DropdownSelect';

export const ORDER_BY: {
  OLDEST: 'oldest',
  NEWEST: 'newest',
} = {
  OLDEST: 'oldest',
  NEWEST: 'newest',
};

type Props = {|
  value: $Values<typeof ORDER_BY>,
  onChange: (newValue: string) => void,
  isParticipant?: boolean,
|};

const AnalysisFilterSort = ({ value, onChange, isParticipant }: Props) => {
  const intl = useIntl();

  return (
    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="argument.sort.label" />
      </Collapsable.Button>
      <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'sort-by' })}>
        <DropdownSelect
          shouldOverflow
          value={value}
          defaultValue={ORDER_BY.NEWEST}
          onChange={newValue => onChange(newValue)}
          title={intl.formatMessage({ id: 'sort-by' })}>
          <DropdownSelect.Choice value={ORDER_BY.NEWEST}>
            {intl.formatMessage({
              id: isParticipant ? 'most.active.users' : 'global.filter_f_last',
            })}
          </DropdownSelect.Choice>
          <DropdownSelect.Choice value={ORDER_BY.OLDEST}>
            {intl.formatMessage({
              id: isParticipant ? 'least.active.users' : 'global.filter_f_old',
            })}
          </DropdownSelect.Choice>
        </DropdownSelect>
      </Collapsable.Element>
    </Collapsable>
  );
};

export default AnalysisFilterSort;
