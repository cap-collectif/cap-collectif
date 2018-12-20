// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm, formValueSelector, isDirty } from 'redux-form';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import renderInput from '../Form/Field';
import { updateRegistrationCommunicationForm as onSubmit } from '../../redux/modules/default';
import type { State } from '../../types';

type Props = {
  useTopText: boolean,
  useBottomText: boolean,
  submitting: boolean,
  handleSubmit: Function,
};

export const formName = 'admin-communication-registration';
export class RegistrationCommunicationForm extends React.Component<Props> {
  render() {
    const { submitting, handleSubmit, useTopText, useBottomText } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="topTextDisplayed"
          type="checkbox"
          children={<FormattedMessage id="registration.admin.topText" />}
          component={renderInput}
        />
        {useTopText && <Field name="topText" type="editor" component={renderInput} />}
        <Field
          name="bottomTextDisplayed"
          type="checkbox"
          children={<FormattedMessage id="registration.admin.bottomText" />}
          component={renderInput}
        />
        {useBottomText && <Field name="bottomText" type="editor" component={renderInput} />}
        <div className="box-content__toolbar btn-toolbar">
          <Button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="global.save" />
            )}
          </Button>
        </div>
      </form>
    );
  }
}

const mapStateToProps = (state: State) => ({
  useTopText: isDirty(formName)(state)
    ? formValueSelector(formName)(state, 'topTextDisplayed') === true
    : state.user.registration_form.topTextDisplayed,
  useBottomText: isDirty(formName)(state)
    ? formValueSelector(formName)(state, 'bottomTextDisplayed') === true
    : state.user.registration_form.bottomTextDisplayed,
  initialValues: {
    topTextDisplayed: state.user.registration_form.topTextDisplayed,
    topText: state.user.registration_form.topText,
    bottomText: state.user.registration_form.bottomText,
    bottomTextDisplayed: state.user.registration_form.bottomTextDisplayed,
  },
});

export default connect(mapStateToProps)(
  reduxForm({
    onSubmit,
    form: formName,
  })(RegistrationCommunicationForm),
);
