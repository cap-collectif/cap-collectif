// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { Field } from 'redux-form';

import renderInput from '~/components/Form/Field';
import type { LocaleAdminModalListItem_locale } from '~relay/LocaleAdminModalListItem_locale.graphql';

type Props = {|
  locale: LocaleAdminModalListItem_locale,
|};

export const LocaleAdminModalListItem = ({ locale }: Props) => {
  const { id, isDefault, traductionKey } = locale;

  return (
    <Field
      disabled={isDefault}
      name={`${id}.isEnabled`}
      type="checkbox"
      divClassName="pl-20"
      children={
        <span className="font-weight-bold">
          <FormattedMessage id={traductionKey} />
        </span>
      }
      component={renderInput}
    />
  );
};

export default createFragmentContainer(LocaleAdminModalListItem, {
  locale: graphql`
    fragment LocaleAdminModalListItem_locale on Locale {
      id
      traductionKey
      isEnabled
      isDefault
    }
  `,
});
