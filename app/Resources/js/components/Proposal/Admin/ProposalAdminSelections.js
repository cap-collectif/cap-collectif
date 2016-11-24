import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { ListGroup, ListGroupItem, Well } from 'react-bootstrap';
import Toggle from 'react-toggle';
import Loader from '../../Utils/Loader';
import { loadSelections, selectStep, unSelectStep } from '../../../redux/modules/proposal';
import { loadSteps } from '../../../redux/modules/project';
import Input from '../../Form/Input';

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
    const { steps, proposalId, dispatch } = this.props;
    console.log(steps);
    return (
      <div className="box box-primary">
        <div className="box-header">
          <h4 className="box-title">Avancement</h4>
          <a href="http://aide.cap-collectif.com/article/115-section-avancement">Lien d'aide</a>
          <h5>Etapes</h5>
        </div>
        <Loader show={steps.length === 0}>
          <ListGroup style={{ margin: 10 }}>
            { steps.map(s =>
              <ListGroupItem className="row" style={{ marginLeft: 0, marginRight: 0 }}>
                <div className="col col-xs-10">
                  <strong>{s.title}</strong>
                  <div>
                    {
                      s.step_type === 'collect'
                      ? 'Etape de dépôt'
                      : 'Etape de sélection'
                    }
                  </div>
                </div>
                <div className="col col-xs-2">
                  <div className="pull-right">
                    <Toggle
                      disabled={s.step_type === 'collect'}
                      checked={s.isSelected}
                      onChange={() => {
                        if (s.isSelected) {
                          unSelectStep(dispatch, proposalId, s.id);
                        } else {
                          selectStep(dispatch, proposalId, s.id);
                        }
                      }}
                    />
                  </div>
                </div>
                {
                  s.isSelected && s.step_type === 'selection' && s.statuses &&
                    <div className="col-xs-12">
                      <Well>
                        <div className="col col-xs-2">Statut</div>
                        <div className="col col-xs-4">
                          <Input
                            type="select"
                            style={{ marginTop: -5 }}
                          >
                            <option value={-1}>Aucun statut</option>
                            {
                              s.statuses.map(status =>
                                <option key={status.id} value={status.id}>
                                  {status.name}
                                </option>
                              )
                            }
                          </Input>
                        </div>
                        <div className="col col-xs-6">L'auteur sera notifié du changement de statut par email</div>
                        <br />
                      </Well>
                    </div>
                }

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
  console.log(proposal);
  return {
    steps: steps.filter(s => s.step_type === 'collect' || s.step_type === 'selection').map(s => {
      s.isSelected = s.step_type === 'collect' || proposal.selections.filter(selection => selection.step.id === s.id).length > 0;
      return s;
    }),
  };
})(ProposalAdminSelections);
