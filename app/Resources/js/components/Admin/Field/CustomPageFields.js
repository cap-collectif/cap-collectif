// @flow
import * as React from 'react';
import { Field, FormSection } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import component from '../../Form/Field';
import type { Uuid } from '../../../types';

export type FormValues = {|
  customcode?: string,
  picto?: ?{ id: Uuid, name: string, url: string },
  metadescription?: string,
|};

type Props = {| picto?: boolean |};

export default class CustomPageFields extends React.Component<Props> {
  defaultProps: {
    picto: false,
  };

  render() {
    const { picto } = this.props;
    return (
      <FormSection name="custom" className="custom-page-fields">
        <Field
          name="metadescription"
          type="text"
          label={<FormattedMessage id="page.metadescription" />}
          help={<FormattedMessage id="admin.help.metadescription" />}
          component={component}
        />

        <Field
          name="customcode"
          type="textarea"
          label={<FormattedMessage id="admin.customcode" />}
          help={<FormattedMessage id="admin.help.customcode" />}
          component={component}
        />
        {picto && (
          <Field
            name="picto"
            type="image"
            label={<FormattedMessage id="admin.fields.page.cover" />}
            component={component}
          />
        )}
      </FormSection>
    );
  }
}
