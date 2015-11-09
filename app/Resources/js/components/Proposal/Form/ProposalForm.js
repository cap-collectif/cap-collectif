import FormMixin from '../../../utils/FormMixin';
import CkeditorMixin from '../../../utils/CkeditorMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import ProposalActions from '../../../actions/ProposalActions';
import FlashMessages from '../../Utils/FlashMessages';
import ArrayHelper from '../../../services/ArrayHelper';
import Input from '../../Form/Input';

const ProposalForm = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
    onValidationFailure: React.PropTypes.func.isRequired,
    onSubmitSuccess: React.PropTypes.func.isRequired,
    onSubmitFailure: React.PropTypes.func.isRequired,
    mode: React.PropTypes.string,
    proposal: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin, DeepLinkStateMixin, FormMixin, CkeditorMixin],

  getDefaultProps() {
    return {
      mode: 'create',
      proposal: {
        title: '',
        body: '',
        theme: {
          id: -1,
        },
        district: {
          id: -1,
        },
        responses: [],
      },
    };
  },

  getInitialState() {
    return {
      form: {
        title: this.props.proposal.title,
        body: this.props.proposal.body,
        theme: this.props.proposal.theme.id,
        district: this.props.proposal.district.id,
      },
      custom: this.getInitialFormAnswers(),
      errors: {
        title: [],
        body: [],
        theme: [],
        district: [],
      },
    };
  },

  componentDidMount() {
    this.initializeCkeditor('body', 'form');

    this.props.form.questions.map((question) => {
      this.initializeCkeditor('custom-' + question.id, 'custom');
    });
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmitting === true) {
      if (this.isValid()) {
        const form = this.state.form;
        const responses = [];
        const custom = this.state.custom;
        Object.keys(custom).map((key) => {
          const question = key.split('-')[1];
          responses.push({
            question: question,
            value: custom[key],
          });
        });
        form.proposalResponses = responses;
        if (this.props.mode === 'edit') {
          ProposalActions
            .update(this.props.form.id, this.props.proposal.id, form)
            .then(() => {
              this.setState(this.getInitialState());
              this.props.onSubmitSuccess();
            })
            .catch(() => {
              this.props.onSubmitFailure();
            });
          return;
        }
        ProposalActions
          .add(this.props.form.id, form)
          .then(() => {
            this.setState(this.getInitialState());
            this.props.onSubmitSuccess();
          })
          .catch(() => {
            this.props.onSubmitFailure();
          });
        return;
      }

      this.props.onValidationFailure();
    }
  },

  getInitialFormAnswers() {
    const custom = {};
    this.props.form.questions.map((question) => {
      custom['custom-' + question.id] = this.getProposalResponseForQuestion(question.id);
    });
    return custom;
  },

  getProposalResponseForQuestion(id) {
    const index = ArrayHelper.getElementIndexFromArray(
      this.props.proposal.responses,
      {question: {id: id}},
      'question',
      'id'
    );
    if (index > -1) {
      return this.props.proposal.responses[index].value;
    }
    return '';
  },

  formValidationRules: {
    theme: {
      minValue: {value: 0, message: 'proposal.constraints.theme'},
    },
    district: {
      minValue: {value: 0, message: 'proposal.constraints.district'},
    },
    title: {
      min: {value: 2, message: 'proposal.constraints.title'},
      notBlank: {message: 'proposal.constraints.title'},
    },
    body: {
      min: {value: 2, message: 'proposal.constraints.body'},
      notBlank: {message: 'proposal.constraints.body'},
    },
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
      return null;
    }
    return <FlashMessages errors={errors} form />;
  },

  render() {
    return (
      <form id="proposal-form" ref="form">

        <Input
          type="text"
          valueLink={this.linkState('form.title')}
          ref="title"
          label={this.getIntlMessage('proposal.title') + '*'}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('title')}
          help={this.renderFormErrors('title')}
          bsStyle={this.getFieldStyle('title')}
        />

        <Input
          type="select"
          ref="theme"
          valueLink={this.linkState('form.theme')}
          label={this.getIntlMessage('proposal.theme') + '*'}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('theme')}
          help={this.renderFormErrors('theme')}
          bsStyle={this.getFieldStyle('theme')}
        >
          <option value={-1} disabled>{this.getIntlMessage('proposal.select.theme')}</option>
          {
            this.props.themes.map((theme) => {
              return (
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>
              );
            })
          }
        </Input>

        <Input
          type="select"
          ref="district"
          valueLink={this.linkState('form.district')}
          label={this.getIntlMessage('proposal.district') + '*'}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('district')}
          help={this.renderFormErrors('district')}
          bsStyle={this.getFieldStyle('district')}
        >
          <option value={-1} disabled>{this.getIntlMessage('proposal.select.district')}</option>
          {
            this.props.districts.map((district) => {
              return (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              );
            })
          }
        </Input>

        <Input
          type="textarea"
          valueLink={this.linkState('form.body')} // state is automatically updated by CkeditorMixin
          ref="body"
          label={this.getIntlMessage('proposal.body') + '*'}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('body')}
          help={this.renderFormErrors('body')}
          bsStyle={this.getFieldStyle('body')}
        />

        {
          this.props.form.questions.map((question) => {
            const ref = 'custom-' + question.id;
            return (
              <div className={'form-group ' + this.getGroupStyle(ref)}>
                <label htmlFor={ref} className="control-label h5">
                  {question.title + ' *'}
                </label>
                { question.helpText
                  ? <span className="help-block">
                      {question.helpText}
                    </span>
                  : null
                }
                <Input
                  type="textarea"
                  valueLink={this.linkState('custom.' + ref)} // state is automatically updated by CkeditorMixin
                  ref={ref}
                />
              </div>
            );
          })
        }

      </form>
    );
  },

});

export default ProposalForm;
