import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import ProposalVoteForm from './ProposalVoteForm';
import LoginButton from '../../User/Login/LoginButton';
import ProposalVoteBoxMessage from './ProposalVoteBoxMessage';
import { VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import RegistrationButton from '../../User/Registration/RegistrationButton';

const ProposalVoteBox = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    creditsLeft: PropTypes.number,
    className: PropTypes.string,
    formWrapperClassName: PropTypes.string,
    isSubmitting: PropTypes.bool.isRequired,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
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
    if (user && creditsLeft !== null && proposal.estimation !== null) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  displayForm() {
    const {
      step,
      user,
    } = this.props;
    return step.voteType === VOTE_TYPE_SIMPLE || (user && this.userHasEnoughCredits());
  },

  render() {
    const {
      className,
      formWrapperClassName,
      isSubmitting,
      proposal,
      step,
      user,
      features,
    } = this.props;
    return (
      <div className={className}>
        {
          !user && step.open
            && <div>
              <p className="text-center small" style={{ fontWeight: 'bold' }}>
                {
                  features.vote_without_account
                  ? this.getIntlMessage('proposal.vote.authenticated')
                  : 'Veuillez vous authentifier pour voter'
                }
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
              {
                features.vote_without_account &&
                  <p className="excerpt p--lined">
                    <span>{this.getIntlMessage('global.or')}</span>
                  </p>
              }
            </div>
        }
        {
          !user && features.vote_without_account &&
          <p className="text-center small" style={{ marginBottom: '0', fontWeight: 'bold' }}>
            {this.getIntlMessage('proposal.vote.non_authenticated')}
          </p>
        }
        <div className={formWrapperClassName}>
          {
            (user || features.vote_without_account) && this.displayForm() &&
              <ProposalVoteForm
                proposal={proposal}
                step={step}
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

const mapStateToProps = state => ({ features: state.default.features });

export default connect(mapStateToProps)(ProposalVoteBox);
