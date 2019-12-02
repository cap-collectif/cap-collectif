// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import component from '../Form/Field';

export class GroupForm extends React.Component<{}> {
  render() {
    const optional = (
      <span className="excerpt">
        <FormattedMessage id="global.optional" />
      </span>
    );

    return (
      <form>
        <Field
          name="title"
          label={<FormattedMessage id='global.name' />}
          component={component}
          type="text"
          id="global.name"
        />

        <Field
          name="description"
          label={
            <span>
              <FormattedMessage id='global.description' /> {optional}
            </span>
          }
          component={component}
          type="textarea"
          id="global.description"
        />
      </form>
    );
  }
}

export default GroupForm;
