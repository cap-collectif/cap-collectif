// @flow
import * as React from 'react';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import renderComponent from '../../Form/Field';
import Fetcher from '../../../services/Fetcher';
// $FlowFixMe we don't cover Synthesis
import SynthesisActions from '../../../actions/SynthesisActions';
import type { State } from '../../../types';

type Props = {
  synthesis: Object,
  submitting: boolean,
  handleSubmit?: Function,
};

const onSubmit = (values, dispatch, props) => {
  const { synthesis } = props;

  return Fetcher.put(`/syntheses/${synthesis.id}/display`, {
    rules: { level: values.level },
  }).then(() => {
    return SynthesisActions.load(synthesis.id);
  });
};

const validate = ({ level }: Object) => {
  const errors = {};
  if (level < 0 || level > 5) {
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
        <form onSubmit={handleSubmit}>
          <label>
            <FormattedMessage id="synthesis.settings.display.level" />
          </label>
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

const mapStateToProps = (state: State, props: Props) => ({
  initialValues: {
    level: props.synthesis.displayRules.level,
  },
});

export default connect(mapStateToProps)(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(DisplaySettings),
);
