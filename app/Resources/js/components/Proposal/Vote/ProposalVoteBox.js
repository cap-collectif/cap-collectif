import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import UserPreview from '../../User/UserPreview';
import ProposalVoteForm from './ProposalVoteForm';
import LoginButton from '../../User/Login/LoginButton';
import ProposalVoteBoxMessage from './ProposalVoteBoxMessage';
import { VOTE_TYPE_BUDGET, VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import RegistrationButton from '../../User/Registration/RegistrationButton';
import { Row, Col } from 'react-bootstrap';

const ProposalVoteBox = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    creditsLeft: PropTypes.number,
    className: PropTypes.string,
    formWrapperClassName: PropTypes.string,
    isSubmitting: PropTypes.bool.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      creditsLeft: null,
      className: '',
      formWrapperClassName: '',
      user: null,
    };
  },

  userHasEnoughCredits() {
    const {
      creditsLeft,
      proposal,
      user,
      // step,
    } = this.props;
    if (user /*! &&  proposal.userHasVoteByStepId[step.id]*/ && creditsLeft !== null && proposal.estimation !== null) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  displayForm() {
    const {
      step,
      user,
    } = this.props;
    return step.open && (step.voteType === VOTE_TYPE_SIMPLE || (user && this.userHasEnoughCredits()));
  },

  render() {
    const {
      className,
      formWrapperClassName,
      isSubmitting,
      proposal,
      step,
      user,
    } = this.props;
    return (
      <div className={className}>
        {
          !user && step.voteType !== VOTE_TYPE_BUDGET && step.open
          && <div>
            <p className="text-center small" style={{ fontWeight: 'bold' }}>
              {this.getIntlMessage('proposal.vote.authenticated')}
            </p>
            <Row>
              <Col xs={12} sm={6}>
                <RegistrationButton
                  className="btn-block"
                  buttonStyle={{ margin: '0' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <LoginButton
                  className="btn-darkest-gray btn-block btn--connection"
                />
              </Col>
            </Row>
            <p className="excerpt p--lined">
              <span>{this.getIntlMessage('global.or')}</span>
            </p>
          </div>
        }
        {
          user
          ? <UserPreview
            user={user}
            style={{ padding: '0', marginBottom: '0', fontSize: '18px' }}
          />
          : <p className="text-center small" style={{ marginBottom: '0', fontWeight: 'bold' }}>
            {this.getIntlMessage('proposal.vote.non_authenticated')}
          </p>
        }
        <div className={formWrapperClassName}>
          {
            this.displayForm() &&
            <ProposalVoteForm
              proposal={proposal}
              step={step}
              isSubmitting={isSubmitting}
            />
          }
          <ProposalVoteBoxMessage
            enoughCredits={this.userHasEnoughCredits()}
            submitting={isSubmitting}
            step={step}
          />
        </div>
      </div>
    );
  },

});

export default ProposalVoteBox;
