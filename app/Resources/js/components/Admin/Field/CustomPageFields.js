// @flow
import * as React from 'react';
// $FlowFixMe
import { Field, FormSection } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import component from '../../Form/Field';

type Props = {
  name?: string,
  customCode?: string,
  socialMedias?: string,
  metadatas?: string,
};

export default class CustomPageFields extends React.Component<Props> {
  render() {
    const { name } = this.props;

    return (
      <FormSection name={`${name || 'name'}.custom`}>
        <Field
          name="metadatas"
          type="text"
          label={<FormattedMessage id="page.metadescription" />}
          component={component}
        />

        <Field
          name="customCode"
          type="textarea"
          label={<FormattedMessage id="admin.customcode" />}
          component={component}
        />

        <Field
          name="socialMedias"
          type="image"
          label={<FormattedMessage id="registration.admin.topText" />}
          component={component}
        />
      </FormSection>
    );
  }
}
