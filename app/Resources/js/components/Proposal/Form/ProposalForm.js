import FormMixin from '../../../utils/FormMixin';
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
    onValidationFailure: React.PropTypes.func,
    onSubmitSuccess: React.PropTypes.func,
    onSubmitFailure: React.PropTypes.func,
    mode: React.PropTypes.string,
    proposal: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin, DeepLinkStateMixin, FormMixin],

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
      onSubmitSuccess: () => {},
      onSubmitFailure: () => {},
      onValidationFailure: () => {},
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
    this.props.form.questions.map((question) => {
      const ref = 'custom-' + question.id;
      this.formValidationRules[ref] = {
        notBlank: {message: 'global.constraints.notBlank'},
      };
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
        <p>
          {this.props.form.description}
        </p>
        <Input
          id="proposal_title"
          type="text"
          ref="title"
          valueLink={this.linkState('form.title')}
          label={this.getIntlMessage('proposal.title') + '*'}
          groupClassName={this.getGroupStyle('title')}
          errors={this.renderFormErrors('title')}
          help={this.props.form.title_help_text}
        />

        <Input
          id="proposal_theme"
          type="select"
          ref="theme"
          valueLink={this.linkState('form.theme')}
          label={this.getIntlMessage('proposal.theme') + '*'}
          groupClassName={this.getGroupStyle('theme')}
          errors={this.renderFormErrors('theme')}
          help={this.props.form.theme_help_text}
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
          id="proposal_district"
          type="select"
          ref="district"
          valueLink={this.linkState('form.district')}
          label={this.getIntlMessage('proposal.district') + '*'}
          groupClassName={this.getGroupStyle('district')}
          errors={this.renderFormErrors('district')}
          help={this.props.form.district_help_text}
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
        id="proposal_body"
        type="editor"
        label={this.getIntlMessage('proposal.body') + '*'}
        groupClassName={this.getGroupStyle('body')}
        errors={this.renderFormErrors('body')}
        valueLink={this.linkState('form.body')}
        help={this.props.form.description_help_text}
      />

      {
        this.props.form.questions.map((question) => {
          const key = 'custom-' + question.id;
          return (
            <Input
              id={'proposal_' + key}
              type="editor"
              label={question.title + '*'}
              groupClassName={this.getGroupStyle(key)}
              valueLink={this.linkState('custom.' + key)}
              help={question.helpText}
              errors={this.renderFormErrors(key)}
            />
          );
        })
      }

      </form>
    );
  },

});

export default ProposalForm;
