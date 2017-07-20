// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ListGroupItem, Well, Col, Button, FormControl } from 'react-bootstrap';
import Toggle from 'react-toggle';
import {
  selectStep,
  unSelectStep,
  updateStepStatus,
  sendProposalNotification,
  sendSelectionNotification,
} from '../../../redux/modules/proposal';
import type { State } from '../../../types';

export const ProposalAdminStepSelector = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    step: PropTypes.object.isRequired,
    proposalId: PropTypes.number.isRequired,
    lastEditedStepId: PropTypes.string,
    lastNotifiedStepId: PropTypes.string,
  },

  render() {
    const {
      step,
      proposalId,
      dispatch,
      lastEditedStepId,
      lastNotifiedStepId,
    } = this.props;
    return (
      <ListGroupItem
        className="row"
        style={{ padding: '10px 0', marginLeft: 0, marginRight: 0 }}>
        <Col xs={10}>
          <strong>
            {step.title}
          </strong>
          <div>
            {step.type === 'collect' ? 'Etape de dépôt' : 'Etape de sélection'}
          </div>
        </Col>
        <Col xs={2}>
          <div className="pull-right">
            <Toggle
              disabled={step.type === 'collect'}
              checked={step.selected}
              onChange={() => {
                if (step.selected) {
                  unSelectStep(dispatch, proposalId, step.id);
                } else {
                  selectStep(dispatch, proposalId, step.id);
                }
              }}
            />
          </div>
        </Col>
        {step.selected &&
          <Col xs={12}>
            <Well className="row" style={{ margin: '10px 0' }}>
              <Col style={{ lineHeight: '34px', marginTop: 6 }} md={1} xs={12}>
                <strong>Statut</strong>
              </Col>
              <Col md={3} xs={12} style={{ marginTop: 6 }}>
                <FormControl
                  componentClass="select"
                  className="status-selector"
                  style={{ marginBottom: 0 }}
                  value={step.status ? step.status.id : -1}
                  onChange={(e: SyntheticInputEvent) => {
                    updateStepStatus(
                      dispatch,
                      proposalId,
                      step,
                      e.target.value,
                    );
                  }}>
                  <option value={-1}>Aucun statut</option>
                  {step.statuses.map(status =>
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>,
                  )}
                </FormControl>
              </Col>
              {(step.type === 'collect' || step.type === 'selection') &&
                <div
                  style={{
                    display: lastNotifiedStepId !== step.id ? 'inline' : 'none',
                  }}>
                  <Col md={6}>
                    <div
                      className="pull-right"
                      style={{
                        fontSize: 14,
                        visibility:
                          lastEditedStepId === step.id ? 'visible' : 'hidden',
                      }}>
                      Souhaitez-vous notifier l'auteur du changement de statut
                      par email ?
                    </div>
                  </Col>
                  <Col md={2}>
                    <div
                      className="pull-right"
                      style={{
                        visibility:
                          lastEditedStepId === step.id ? 'visible' : 'hidden',
                      }}>
                      <Button
                        bsStyle={
                          lastEditedStepId !== step.id ? 'default' : 'primary'
                        }
                        disabled={lastEditedStepId !== step.id}
                        onClick={() => {
                          if (step.type === 'collect') {
                            return sendProposalNotification(
                              dispatch,
                              proposalId,
                              step.id,
                            );
                          }

                          return sendSelectionNotification(
                            dispatch,
                            proposalId,
                            step.id,
                          );
                        }}>
                        Notifier l'auteur
                      </Button>
                    </div>
                  </Col>
                </div>}
              {lastNotifiedStepId === step.id &&
                <Col sm={8}>
                  <div
                    className="pull-right"
                    style={{ color: '#08af0d', fontSize: 16 }}>
                    <i className="fa fa-check-circle-o" /> L'email a bien été
                    envoyé.
                  </div>
                </Col>}
            </Well>
          </Col>}
      </ListGroupItem>
    );
  },
});

export default connect((state: State) => {
  return {
    lastEditedStepId: state.proposal.lastEditedStepId,
    lastNotifiedStepId: state.proposal.lastNotifiedStepId,
  };
})(ProposalAdminStepSelector);
