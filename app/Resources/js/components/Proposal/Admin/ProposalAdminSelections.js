import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { ListGroup, ListGroupItem, Well, Col, Button, FormControl } from 'react-bootstrap';
import Toggle from 'react-toggle';
import Loader from '../../Utils/Loader';
import { loadSelections, selectStep, unSelectStep, updateStepStatus, sendProposalNotification, sendSelectionNotification } from '../../../redux/modules/proposal';
import { loadSteps } from '../../../redux/modules/project';

export const ProposalAdminSelections = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    steps: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
    proposalId: PropTypes.number.isRequired,
    lastEditedStepId: PropTypes.number.isRequired,
    lastNotifiedStepId: PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    const { dispatch, projectId, proposalId } = this.props;
    dispatch(loadSelections(proposalId));
    dispatch(loadSteps(projectId));
  },

  render() {
    const { steps, proposalId, dispatch, lastEditedStepId, lastNotifiedStepId } = this.props;
    return (
      <div className="box box-primary">
        <div className="box-header">
          <h4 className="box-title">Avancement</h4>
          <a className="pull-right link" target="_blank" rel="noopener noreferrer" href="https://aide.cap-collectif.com/article/115-section-avancement">
            <i className="fa fa-info-circle" /> {' '} Aide
          </a>
          <h5 style={{ marginBottom: 0, fontWeight: 'bold' }}>Etapes</h5>
        </div>
        <Loader show={steps.length === 0}>
          <ListGroup style={{ margin: 10, paddingBottom: 10 }}>
            { steps.map(s =>
              <ListGroupItem className="row" style={{ padding: '10px 0', marginLeft: 0, marginRight: 0 }}>
                <Col xs={10}>
                  <strong>{s.title}</strong>
                  <div>
                    {
                      s.step_type === 'collect'
                      ? 'Etape de dépôt'
                      : 'Etape de sélection'
                    }
                  </div>
                </Col>
                <Col xs={2}>
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
                </Col>
                {
                  s.isSelected &&
                    <Col xs={12}>
                      <Well className="row" style={{ margin: '10px 0' }}>
                        <Col style={{ lineHeight: '34px', marginTop: 6 }} md={1} xs={12}><strong>Statut</strong></Col>
                        <Col md={3} xs={12} style={{ marginTop: 6 }}>
                          <FormControl
                            componentClass="select"
                            style={{ marginBottom: 0 }}
                            value={s.status ? s.status.id : -1}
                            onChange={(e) => { updateStepStatus(dispatch, proposalId, s, e.target.value); }}
                          >
                            <option value={-1}>Aucun statut</option>
                            {
                              s.statuses.map(st => <option key={st.id} value={st.id}>{st.name}</option>)
                            }
                          </FormControl>
                        </Col>
                        {
                          (s.step_type === 'collect' || s.step_type === 'selection') &&
                          <div style={{ display: lastNotifiedStepId !== s.id ? 'inline' : 'none' }}>
                            <Col md={6}>
                              <div className="pull-right" style={{ fontSize: 14, visibility: lastEditedStepId === s.id ? 'visible' : 'hidden' }}>
                                Souhaitez-vous notifier l'auteur du changement de statut par email ?
                              </div>
                            </Col>
                            <Col md={2}>
                              <div className="pull-right" style={{ visibility: lastEditedStepId === s.id ? 'visible' : 'hidden' }}>
                               <Button
                                 bsStyle={lastEditedStepId !== s.id ? 'default' : 'primary'}
                                 disabled={lastEditedStepId !== s.id}
                                 onClick={() => {
                                   if (s.step_type === 'collect') {
                                     return sendProposalNotification(dispatch, proposalId, s.id);
                                   }

                                   return sendSelectionNotification(dispatch, proposalId, s.id);
                                 }}
                               >
                                 Notifier l'auteur
                               </Button>
                              </div>
                            </Col>
                          </div>
                        }
                        {
                          lastNotifiedStepId === s.id &&
                            <Col sm={8}>
                              <div className="pull-right" style={{ color: '#08af0d', fontSize: 16 }}>
                                <i className="fa fa-check-circle-o"></i>
                                { ' ' }
                                L'email a bien été envoyé.
                              </div>
                            </Col>
                        }
                      </Well>
                    </Col>
                }
              </ListGroupItem>,
            )
            }
          </ListGroup>
        </Loader>
      </div>
    );
  },
});

export default connect((state, props) => {
  const steps = state.project.projectsById[props.projectId].steps;
  const proposal = state.proposal.proposalsById[props.proposalId];
  return {
    steps: steps.filter(s => s.step_type === 'collect' || s.step_type === 'selection').map((s) => {
      const selectionAsArray = proposal.selections.filter(sel => sel.step.id === s.id);
      s.isSelected = s.step_type === 'collect' || selectionAsArray.length > 0;
      if (s.step_type === 'collect') {
        s.status = proposal.status;
      } else {
        s.status = s.isSelected ? selectionAsArray[0].status : null;
      }
      return s;
    }),
    lastEditedStepId: state.proposal.lastEditedStepId,
    lastNotifiedStepId: state.proposal.lastNotifiedStepId,
  };
})(ProposalAdminSelections);
