import FormMixin from '../../../utils/FormMixin';
import CkeditorMixin from '../../../utils/CkeditorMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';

import OpinionLinkActions from '../../../actions/OpinionLinkActions';
import OpinionTypeActions from '../../../actions/OpinionLinkActions';

import FlashMessages from '../../Utils/FlashMessages';
import OpinionLinkCreateButton from './OpinionLinkCreateButton';

const Input = ReactBootstrap.Input;

const OpinionLinkForm = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
    validationFailed: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, DeepLinkStateMixin, FormMixin, CkeditorMixin],
  formValidationRules: {
    title: {
      min: {value: 2, message: 'source.constraints.title'},
      notBlank: {message: 'source.constraints.title'},
    },
    body: {
      min: {value: 2, message: 'source.constraints.body'},
      notBlank: {message: 'source.constraints.body'},
    },
  },

  getInitialState() {
    // add appendices
    return {
      form: {
        title: '',
        body: '',
        link: null,
      },
      types: [],
      errors: {
        title: [],
        body: [],
      }
    };
  },

  componentDidMount() {
    OpinionTypeActions
      .getAvailableTypes()
      .then((types) => {
        console.log(types);
        this.setState({'types': types});
      });

    this.initializeCkeditor('body', 'form');
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmitting === true) {
      if (this.isValid()) {
        OpinionLinkActions
          .add(this.props.opinion.consultation.id, this.state.form)
          .then(() => {this.setState(this.getInitialState())})
        ;
        return;
      }

      this.props.validationFailed();
    }
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
       return null;
    }
    return <FlashMessages errors={errors} form={true} />;
  },

  render() {
    return (
      <form id="opinion-links-form" ref="form">

        <Input
          type="text"
          valueLink={this.linkState('form.title')}
          label={this.getIntlMessage('opinion.title')}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('title')}
          ref="title"
          help={this.renderFormErrors('title')}
          bsStyle={this.getFieldStyle('title')}
        />

        <Input
          type="textarea"
          valueLink={null} // state is updated by CkeditorMixin
          label={this.getIntlMessage('opinion.body')}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('body')}
          ref="body"
          help={this.renderFormErrors('body')}
          bsStyle={this.getFieldStyle('body')}
        />

      </form>
    );
  },

  reload() {
    this.setState(this.getInitialState());
    location.reload(); // TODO when enough time
    return true;
  },

});

export default OpinionLinkForm;
