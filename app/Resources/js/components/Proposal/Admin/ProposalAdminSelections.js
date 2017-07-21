// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ListGroup } from 'react-bootstrap';
import ProposalAdminStepSelector from './ProposalAdminStepSelector';
import Loader from '../../Utils/Loader';
import { loadSelections } from '../../../redux/modules/proposal';
import type { State, Uuid } from '../../../types';

export const ProposalAdminSelections = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    steps: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
    proposalId: PropTypes.number.isRequired,
  },

  componentDidMount() {
    const { dispatch, proposalId } = this.props;
    dispatch(loadSelections(proposalId));
  },

  render() {
    const { steps, proposalId } = this.props;
    return (
      <div className="box box-primary">
        <div className="box-header">
          <h4 className="box-title">Avancement</h4>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/115-section-avancement">
            <i className="fa fa-info-circle" /> Aide
          </a>
          <h5 style={{ marginBottom: 0, fontWeight: 'bold' }}>Etapes</h5>
        </div>
        <Loader show={steps.length === 0}>
          <ListGroup style={{ margin: 10, paddingBottom: 10 }}>
            {steps.map((step, index) =>
              <ProposalAdminStepSelector
                step={step}
                key={index}
                proposalId={proposalId}
              />,
            )}
          </ListGroup>
        </Loader>
      </div>
    );
  },
});

type PassedProps = {
  projectId: Uuid,
  proposalId: number,
};

export default connect((state: State, props: PassedProps) => {
  const stepsById = state.project.projectsById[props.projectId].stepsById;
  const proposal = state.proposal.proposalsById[props.proposalId];
  return {
    steps: Object.keys(stepsById)
      .map(i => stepsById[i])
      .filter(step => step.type === 'collect' || step.type === 'selection')
      .map(s => {
        const step = { ...s };
        const selectionAsArray = proposal.selections.filter(
          selection => selection.step.id === step.id,
        );
        step.selected = step.type === 'collect' || selectionAsArray.length > 0;
        if (step.type === 'collect') {
          step.status = proposal.status;
        } else {
          step.status = step.selected ? selectionAsArray[0].status : null;
        }
        return step;
      }),
  };
})(ProposalAdminSelections);
