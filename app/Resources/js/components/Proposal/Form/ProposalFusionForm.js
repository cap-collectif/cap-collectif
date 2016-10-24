import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { fetchProjects } from '../../../redux/modules/project';
import { loadProposals } from '../../../redux/modules/proposal';
import { Field, reduxForm, change } from 'redux-form';
import Input from '../../Form/Input';

const formName = 'proposal';

const renderField = ({error, touched, input: { placeholder, type, autoFocus, label, name, labelClassName }}) => { // eslint-disable-line
  return (<Input
    type={type}
    name={name}
    labelClassName={labelClassName || ''}
    label={label || null}
    placeholder={placeholder || null}
    // errors={(touched && error) ? this.getIntlMessage(error) : null}
    bsStyle={touched ? (error ? 'error' : 'success') : null}
    hasFeedback={touched}
  />);
};

const validate = (values) => {
  console.log(values);
};
const handleSubmit = () => {};

let ProposalFusionForm = React.createClass({
  propTypes: {
    proposalForm: PropTypes.object,
    projects: PropTypes.array.isRequired,
    proposals: PropTypes.array.isRequired,
    onMount: PropTypes.func.isRequired,
    onProjectChangeForm: PropTypes.func.isRequired,
    onProjectChange: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    this.props.onMount();
  },

  render() {
    const { projects, proposals, onProjectChange, onProjectChangeForm } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field name="project" component="select" onChange={e => {
          onProjectChangeForm(formName, 'project', e.target.value);
          onProjectChange(projects.find(p => parseInt(p.id, 10) === parseInt(e.target.value, 10)).steps.filter(step => step.type === 'collect')[0]);
        }}
        >
            <option>Sélectionner un projet</option>
            {
              projects.map(project => <option value={project.id}>{project.title}</option>)
            }
        </Field>
        <br />
        <Field name="proposal" component="select">
            <option>Sélectionner les propositions à fusionner</option>
            {
              proposals.map(proposal => <option value={proposal.id}>{proposal.title}</option>)
            }
        </Field>
      </form>
    );
  },
});

ProposalFusionForm = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  validate,
})(ProposalFusionForm);

ProposalFusionForm = connect(state => ({
  projects: state.project.projects.filter(project => project.steps.filter(step => step.type === 'collect').length > 0),
  proposals: Object.values(state.proposal.proposalsById),
  proposalForm: null,
}), { onMount: fetchProjects, onProjectChange: loadProposals, onProjectChangeForm: change })(ProposalFusionForm);

export default ProposalFusionForm;
