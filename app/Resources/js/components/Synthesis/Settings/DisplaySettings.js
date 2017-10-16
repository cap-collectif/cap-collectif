import * as React from 'react';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import renderComponent from '../../Form/Field';
import Fetcher from '../../../services/Fetcher';
import SynthesisActions from '../../../actions/SynthesisActions';

type Props = {
  synthesis?: Object,
  submitting: boolean,
  handleSubmit?: Function,
};
const onSubmit = (values, dispatch, props) => {
  const { synthesis } = props;

  console.log(values);

  return Fetcher.put(`/syntheses/${synthesis}/display`, values).then(() => {
    SynthesisActions.load(synthesis);
  });
};

const validate = ({ level }: Object) => {
  const errors = {};
  if (level < 1 || level > 5) {
    errors.level = 'synthesis.settings.display.level_constraints';
  }

  return errors;
};

export const formName = 'DisplaySettings';

export class DisplaySettings extends React.Component<Props> {
  render() {
    const { submitting, handleSubmit } = this.props;

    return (
      <div className="display-settings">
        <form onSubmit={handleSubmit()}>
          <label>{<FormattedMessage id="synthesis.settings.display.level" />}</label>
          <br />
          <FormattedMessage id="synthesis.settings.display.level_help" />
          <Field
            id="display-settings__form__input"
            type="number"
            name="level"
            component={renderComponent}
          />
          <Button type="submit">
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="global.save" />
            )}
          </Button>
        </form>
      </div>
    );
  }
}

export default connect()(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(DisplaySettings),
);
