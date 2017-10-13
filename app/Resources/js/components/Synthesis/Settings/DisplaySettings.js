import * as React from 'react';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import renderComponent from '../../Form/Field';
// import AppDispatcher from '../../../dispatchers/AppDispatcher';
// import Fetcher from '../../../services/Fetcher';
// import * as Actions from '../../../constants/SynthesisActionsConstants';
import SynthesisActions from '../../../actions/SynthesisActions';
// import Input from '../../Form/Input';
// import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
// import FormMixin from '../../../utils/FormMixin';
// import FlashMessages from '../../Utils/FlashMessages';

type Props = {
  synthesis?: Object,
}

type State = {
  isSaving: boolean,
  form: Object,
}

const validate = ({ level }: Object, props: Props) => {
  const errors = {};
  const { synthesis } = props;
  if(synthesis) {
    if(synthesis.displayRules.level < 1 || synthesis.displayRules.level > 5) {
      errors.level = 'synthesis.settings.display.level_constraints';
    }
  }
  return errors;
};

// const onSubmit = (values, dispatch, props) => {
  // const { synthesis, settings } = props;
  // const data = values;
  //
  // return Fetcher
  //   .put(`/syntheses/${synthesis}/display`, settings)
  //   .then(data => (
  //     AppDispatcher.dispatch({
  //       actionType: Actions.RECEIVE_SYNTHESIS,
  //       synthesis: data,
  //     })
  //
  //   ))
// }

// export default {
//   updateDisplaySettings: (synthesis, settings) => {
//     return Fetcher.put(`/syntheses/${synthesis}/display`, settings);
//   },
//
//   load: synthesis => {
//     Fetcher.get(`/syntheses/${synthesis}`).then(data => {
//       AppDispatcher.dispatch({
//         actionType: Actions.RECEIVE_SYNTHESIS,
//         synthesis: data,
//       });
//       return true;
//     });
//   },
// };


export const formName = 'DisplaySettings';

export class DisplaySettings extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isSaving: false,
    }
  }
  // mixins: [DeepLinkStateMixin, FormMixin];

  // getInitialState() {
  //   const { synthesis } = this.props;
  //
  //   return {
  //     isSaving: false,
  //     form: synthesis.displayRules || {
  //       level: 1,
  //     },
  //     errors: {
  //       level: [],
  //     },
  //   };
  // };

  // formValidationRules: {
  //   level: {
  //     minValue: {
  //       value: 0,
  //       message: 'synthesis.settings.display.level_constraints',
  //     },
  //     maxValue: {
  //       value: 5,
  //       message: 'synthesis.settings.display.level_constraints',
  //     },
  //   },
  // };

  updateSettings() {
    if (validate.errors.length !== 0) {
      this.setState({
        isSaving: false
      });
      return false;
    } else {
      this.setState({
        isSaving: false
      });
      return true;
    }
  };

  // updateSettings() {
  //   const { synthesis } = this.props;
  //   if (this.isValid()) {
  //     this.setState({
  //       isSaving: true,
  //     });
  //     SynthesisActions.updateDisplaySettings(synthesis.id, {
  //       rules: this.state.form,
  //     }).then(() => {
  //       SynthesisActions.load(synthesis.id);
  //       this.setState({
  //         isSaving: false,
  //       });
  //     });
  //   }
  //   return false;
  // };

  // renderFormErrors(field) {
  //   const errors = this.getErrorsMessages(field);
  //   if (errors.length === 0) {
  //     return null;
  //   }
  //   return <FlashMessages errors={errors} form />;
  // };

  render() {
    const { synthesis } = this.props;
    const { isSaving } = this.state;
    // console.log(isSaving);

    const fieldMin = value => {
      if(value < 0) {
        return 0
      } else {
        return value
      }
    };

    return (
      <div className="display-settings">
        <form>
          <label>{<FormattedMessage id="synthesis.settings.display.level" />}</label>
          <br/>
          <FormattedMessage id="synthesis.settings.display.level_help" />
          <Field
            id={synthesis.id}
            type="number"
            name="level"
            component={renderComponent}
            normalize={fieldMin}
          />
          <Button type="button" onChange={() => this.updateSettings()}>
            {isSaving ? (
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
      form: formName,
    })(DisplaySettings)
);
