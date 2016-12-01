import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { ListGroup, ListGroupItem, Well } from 'react-bootstrap';
// import Toggle from 'react-toggle';
import Loader from '../../Utils/Loader';
import { loadSelections, selectStep, unSelectStep, updateStepStatus } from '../../../redux/modules/proposal';
import { loadSteps } from '../../../redux/modules/project';
import Input from '../../Form/Input';
import { bootstrapToHex } from '../../../utils/bootstrapToHexColor';

export const ProposalAdminSelections = React.createClass({
  // propTypes: {
  //   dispatch: PropTypes.func.isRequired,
  //   steps: PropTypes.array.isRequired,
  //   projectId: PropTypes.number.isRequired,
  //   proposalId: PropTypes.number.isRequired,
  // },
  mixins: [IntlMixin],

  componentDidMount() {
    const { dispatch, projectId, proposalId } = this.props;
    dispatch(loadSelections(proposalId));
    dispatch(loadSteps(projectId));
  },

  render() {
    const { steps, proposalId, dispatch } = this.props;
    return (
      <div className="box box-primary">
        <div className="box-header">
          <h4 className="box-title">Avancement</h4>
          <a className="pull-right link" target="_blank" rel="noopener noreferrer" href="http://aide.cap-collectif.com/article/115-section-avancement">
            <i className="fa fa-info-circle" /> {' '} Aide
          </a>
          <h5 style={{ marginBottom: 0, fontWeight: 'bold' }}>Etapes</h5>
        </div>
        <Loader show={steps.length === 0}>
          <ListGroup style={{ margin: 10, paddingBottom: 10 }}>
            { steps.map(s =>
              <ListGroupItem className="row" style={{ padding: '10px 0', marginLeft: 0, marginRight: 0 }}>
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
                    {/* <Toggle
                      disabled={s.step_type === 'collect'}
                      checked={s.isSelected}
                      onChange={() => {
                      if (s.isSelected) {
                      unSelectStep(dispatch, proposalId, s.id);
                      } else {
                      selectStep(dispatch, proposalId, s.id);
                      }
                      }}
                    /> */}
                  </div>
                </div>
                {
                  s.isSelected &&
                    <div className="col-xs-12">
                      <Well className="row" style={{ margin: '10px 0' }}>
                        <div style={{ lineHeight: '34px' }} className="col col-md-1 col-xs-12"><strong>Statut</strong></div>
                        <div className="col col-md-5 col-xs-12">
                          <Input
                            type="select"
                            style={{ marginBottom: 0 }}
                            value={s.status ? s.status.id : -1}
                            onChange={e => { updateStepStatus(dispatch, proposalId, s, e.target.value); }}
                          >
                            <option value={-1}>Aucun statut</option>
                            {
                              s.statuses.map(st => <option key={st.id} value={st.id}>{st.name}</option>)
                            }
                          </Input>
                        </div>
                        {
                          s.step_type === 'collect' &&
                            <div style={{ lineHeight: '34px', color: bootstrapToHex('info') }} className="col col-md-6">
                              <i className="fa fa-info-circle" />
                              { ' ' }
                              L'auteur sera notifié du changement de statut par email
                            </div>
                        }
                      </Well>
                    </div>
                }
              </ListGroupItem>
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
    steps: steps.filter(s => s.step_type === 'collect' || s.step_type === 'selection').map(s => {
      const selectionAsArray = proposal.selections.filter(sel => sel.step.id === s.id);
      s.isSelected = s.step_type === 'collect' || selectionAsArray.length > 0;
      if (s.step_type === 'collect') {
        s.status = proposal.status;
      } else {
        s.status = s.isSelected ? selectionAsArray[0].status : null;
      }
      return s;
    }),
  };
})(ProposalAdminSelections);
