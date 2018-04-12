// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import ProposalVoteForm from './ProposalVoteForm';
import type { State } from '../../../types';

type Props = {
  proposal: Object,
  step: Object,
  className: string,
  formWrapperClassName: string,
  features: Object,
};

class ProposalVoteBox extends React.Component<Props> {
  static defaultProps = {
    className: '',
    formWrapperClassName: '',
  };

  render() {
    const { className, formWrapperClassName, proposal, step } = this.props;
    return (
      <div className={className} id="proposal-vote-box">
        <div className={formWrapperClassName}>
          <ProposalVoteForm proposal={proposal} step={step} />
        </div>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(ProposalVoteBox);
