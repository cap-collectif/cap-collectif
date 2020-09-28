// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Collapsable from '~ui/Collapsable';
import DropdownSelect from '~ui/DropdownSelect';
import type { Uuid } from '~/types';

export type ThemeFilter = {|
  +id: Uuid,
  +title: string,
|};

type Props = {|
  themes: $ReadOnlyArray<ThemeFilter>,
  value: 'ALL' | 'NONE' | Uuid,
  onChange: (newValue: string) => void,
|};

const AnalysisFilterTheme = ({ themes = [], value, onChange }: Props) => {
  const intl = useIntl();

  return (
    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="admin.fields.proposal.theme" />
      </Collapsable.Button>
      <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'admin.fields.proposal.theme' })}>
        <DropdownSelect
          shouldOverflow
          value={value}
          defaultValue="ALL"
          onChange={newValue => onChange(newValue)}
          title={intl.formatMessage({ id: 'admin.fields.proposal.theme' })}>
          <DropdownSelect.Choice value="ALL">
            {intl.formatMessage({ id: 'global.select_themes' })}
          </DropdownSelect.Choice>
          <DropdownSelect.Choice value="NONE">
            {intl.formatMessage({ id: 'admin.fields.proposal.no_theme' })}
          </DropdownSelect.Choice>
          {themes.map(theme => (
            <DropdownSelect.Choice key={theme.id} value={theme.id}>
              {theme.title}
            </DropdownSelect.Choice>
          ))}
        </DropdownSelect>
      </Collapsable.Element>
    </Collapsable>
  );
};

export default AnalysisFilterTheme;
