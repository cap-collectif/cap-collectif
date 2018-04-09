// @flow
import * as React from 'react';
<<<<<<< HEAD
import ProposalVoteForm from './ProposalVoteForm';
=======
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import ProposalVoteForm from './ProposalVoteForm';
import LoginButton from '../../User/Login/LoginButton';
import ProposalVoteBoxMessage from './ProposalVoteBoxMessage';
import { VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import RegistrationButton from '../../User/Registration/RegistrationButton';
import type { State } from '../../../types';
>>>>>>> Implement addVote and removeVote mutations

type Props = {
  proposal: Object,
  step: Object,
<<<<<<< HEAD
};
=======
  creditsLeft: number,
  className: string,
  formWrapperClassName: string,
  isSubmitting: boolean,
  user: ?Object,
  features: Object,
};

class ProposalVoteBox extends React.Component<Props> {
  static defaultProps = {
    creditsLeft: null,
    className: '',
    formWrapperClassName: '',
    user: null,
  };

  userHasEnoughCredits = () => {
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
  };

  displayForm = () => {
    const { step, user } = this.props;
    return step.voteType === VOTE_TYPE_SIMPLE || (user && this.userHasEnoughCredits());
  };
>>>>>>> Implement addVote and removeVote mutations

class ProposalVoteBox extends React.Component<Props> {
  render() {
    const { proposal, step } = this.props;
    return (
      <div id="proposal-vote-box">
        <div>
          <ProposalVoteForm proposal={proposal} step={step} />
        </div>
      </div>
    );
  }
}
<<<<<<< HEAD
=======

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  features: state.default.features,
});
>>>>>>> Implement addVote and removeVote mutations

export default ProposalVoteBox;
