// @flow
import * as React from 'react';
// $FlowFixMe FormSection is not updated in redux-form typedef
import { Field, FormSection } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import component from '../../Form/Field';
import type { Uuid } from '../../../types';

export type FormValues = {|
  customcode?: string,
  picto?: ?{ id: Uuid, name: string, url: string },
  metadescription?: string,
|};

type Props = {||};

export default class CustomPageFields extends React.Component<Props> {
  render() {
    return (
      <FormSection name="custom" className="custom-page-fields">
        <Field
          name="metadescription"
          type="text"
          label={<FormattedMessage id="page.metadescription" />}
          component={component}
        />

        <Field
          name="customcode"
          type="textarea"
          label={<FormattedMessage id="admin.customcode" />}
          component={component}
        />

        <Field
          name="picto"
          type="image"
          label={<FormattedMessage id="admin.fields.page.cover" />}
          component={component}
        />
      </FormSection>
    );
  }
}
