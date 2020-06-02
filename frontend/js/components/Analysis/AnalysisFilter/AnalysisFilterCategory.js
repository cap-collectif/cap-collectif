// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Collapsable from '~ui/Collapsable';
import DropdownSelect from '~ui/DropdownSelect';
import type { Uuid } from '~/types';

export type CategoryFilter = {|
  +id: Uuid,
  +name: string,
|};

type Props = {|
  categories: $ReadOnlyArray<CategoryFilter>,
  value: 'ALL' | 'NONE' | Uuid,
  onChange: (newValue: string) => void,
|};

const AnalysisFilterCategory = ({ categories, value, onChange }: Props) => {
  const intl = useIntl();

  return (
    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="admin.fields.proposal.category" />
      </Collapsable.Button>
      <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'admin.fields.proposal.category' })}>
        <DropdownSelect
          shouldOverflow
          value={value}
          onChange={newValue => onChange(newValue)}
          title={intl.formatMessage({ id: 'admin.fields.proposal.category' })}>
          <DropdownSelect.Choice value="ALL">
            {intl.formatMessage({ id: 'global.select_categories' })}
          </DropdownSelect.Choice>
          <DropdownSelect.Choice value="NONE">
            {intl.formatMessage({ id: 'global.select_no-categories' })}
          </DropdownSelect.Choice>
          {categories.map(cat => (
            <DropdownSelect.Choice key={cat.id} value={cat.id}>
              {cat.name}
            </DropdownSelect.Choice>
          ))}
        </DropdownSelect>
      </Collapsable.Element>
    </Collapsable>
  );
};

export default AnalysisFilterCategory;
