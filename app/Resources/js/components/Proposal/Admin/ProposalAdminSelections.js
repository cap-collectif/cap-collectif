import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Toggle from 'react-toggle';
import Loader from '../../Utils/Loader';
import { loadSelections } from '../../../redux/modules/proposal';
import { loadSteps } from '../../../redux/modules/project';

export const ProposalAdminSelections = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    steps: PropTypes.array.isRequired,
    projectId: PropTypes.number.isRequired,
    proposalId: PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    const { dispatch, projectId, proposalId } = this.props;
    dispatch(loadSelections(proposalId));
    dispatch(loadSteps(projectId));
  },

  render() {
    const { steps, dispatch } = this.props;
    console.log(steps);
    return (
      <div className="box box-primary">
        <div className="box-header">
          <h4 className="box-title">Avancement</h4>
          <h5>Etapes</h5>
        </div>
        <Loader show={steps.length === 0}>
          <ListGroup style={{ margin: 10 }}>
            { steps.map(s =>
              <ListGroupItem>
                <strong>{s.title}</strong>
                <div className="pull-right">
                  <Toggle
                    disabled={s.step_type === 'collect'}
                    checked={s.isSelected}
                    onChange={() => {
                      if (s.isSelected) {
                        dispatch(unSelectStep(proposalId, s.id));
                      } else {
                        dispatch(selectStep(proposalId, s.id));
                      }
                    }}
                  />
                </div>
              </ListGroupItem>
            )
            }
          </ListGroup>
        </Loader>
        <br />
      </div>
    );
  },
});

export default connect((state, props) => {
  const steps = state.project.projectsById[props.projectId].steps;
  const proposal = state.proposal.proposalsById[props.proposalId];
  return {
    steps: steps.filter(s => s.step_type === 'collect' || s.step_type === 'selection').map(s => {
      s.isSelected = proposal.selections.filter(selection => s.step_type === 'collect' || selection.step.id === s.id).length > 0;
      return s;
    }),
  };
})(ProposalAdminSelections);
