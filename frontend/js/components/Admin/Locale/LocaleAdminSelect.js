// @flow
import React from 'react';
import { connect } from 'react-redux';
import { useIntl, type IntlShape } from 'react-intl';
import { Field, formValueSelector } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import type { GlobalState } from '~/types';
import select from '~/components/Form/Select';
import type { LocaleAdminSelect_locales } from '~relay/LocaleAdminSelect_locales.graphql';

export type Locales = { [string]: { id: string, isPublished: boolean, isEnabled: boolean } };

type Props = {|
  locales: LocaleAdminSelect_locales,
  currentValues: Locales,
  formName: string,
|};

type LocaleOption = {|
  +value: string,
  +label: string,
|};

const renderOptions = (props: Props, intl: IntlShape): LocaleOption[] => {
  const { locales, currentValues } = props;
  if (locales.length > 0) {
    return locales
      .filter(
        l =>
          currentValues[l.id] && currentValues[l.id].isEnabled && currentValues[l.id].isPublished,
      )
      .map(locale => ({
        value: locale.id,
        label: intl.formatMessage({ id: locale.traductionKey }),
      }));
  }
  return [];
};

const SelectContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  max-width: 30%;
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export const LocaleAdminSelect = (props: Props) => {
  const intl = useIntl();

  return (
    <SelectContainer className="mt-10">
      <Field
        name="defaultLocale"
        type="select"
        clearable={false}
        component={select}
        label={intl.formatMessage({ id: 'default-language' })}
        options={renderOptions(props, intl)}
      />
    </SelectContainer>
  );
};

const mapStateToProps = (state: GlobalState, { formName }: Props) => ({
  currentValues: formValueSelector(formName)(state, 'locales'),
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(LocaleAdminSelect);

export default createFragmentContainer(container, {
  locales: graphql`
    fragment LocaleAdminSelect_locales on Locale @relay(plural: true) {
      id
      traductionKey
    }
  `,
});
