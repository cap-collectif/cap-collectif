// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Collapsable from '~ui/Collapsable';
import DropdownSelect from '~ui/DropdownSelect';
import type { Uuid } from '~/types';

export type DistrictFilter = {|
  +id: Uuid,
  +name: string,
|};

type Props = {|
  districts: $ReadOnlyArray<DistrictFilter>,
  value: 'ALL' | 'NONE' | Uuid,
  onChange: (newValue: string) => void,
|};

const AnalysisFilterDistrict = ({ districts, value, onChange }: Props) => {
  const intl = useIntl();

  return (
    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="admin.fields.proposal.map.zone" />
      </Collapsable.Button>
      <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'admin.fields.proposal.map.zone' })}>
        <DropdownSelect
          shouldOverflow
          value={value}
          defaultValue="ALL"
          onChange={newValue => onChange(newValue)}
          title={intl.formatMessage({ id: 'admin.fields.proposal.map.zone' })}>
          <DropdownSelect.Choice value="ALL">
            {intl.formatMessage({ id: 'global.select_districts' })}
          </DropdownSelect.Choice>
          <DropdownSelect.Choice value="NONE">
            {intl.formatMessage({ id: 'global.select_no-districts' })}
          </DropdownSelect.Choice>
          {districts.map(district => (
            <DropdownSelect.Choice key={district.id} value={district.id}>
              {district.name}
            </DropdownSelect.Choice>
          ))}
        </DropdownSelect>
      </Collapsable.Element>
    </Collapsable>
  );
};

export default AnalysisFilterDistrict;
