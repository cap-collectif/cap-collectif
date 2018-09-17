// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { openDetailLikersModal } from '../../../redux/modules/proposal';
import ProposalDetailLikersLabel from './ProposalDetailLikersLabel';
import ProposalDetailLikersModal from './ProposalDetailLikersModal';
import type { ProposalDetailLikers_proposal } from './__generated__/ProposalDetailLikers_proposal.graphql';
import type { Dispatch, State } from '../../../types';

type Props = {
  proposal: ProposalDetailLikers_proposal,
  componentClass: string,
  showModal: boolean,
  dispatch: Dispatch,
};

export class ProposalDetailLikers extends React.Component<Props> {
  static defaultProps = {
    componentClass: 'a',
  };

  render() {
    const { proposal, componentClass, showModal, dispatch } = this.props;
    const Component = componentClass;
    if (proposal.likers.length > 0) {
      return (
        <React.Fragment>
          <Component className="tags-list__tag" onClick={() => dispatch(openDetailLikersModal())}>
            {/* $FlowFixMe */}
            <ProposalDetailLikersLabel proposal={proposal} />
          </Component>
          {/* $FlowFixMe */}
          <ProposalDetailLikersModal show={showModal} proposal={proposal} />
        </React.Fragment>
      );
    }

    return null;
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  showModal: state.proposal.showDetailLikersModal,
});

const container = connect(mapStateToProps)(ProposalDetailLikers);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalDetailLikers_proposal on Proposal {
      id
      likers {
        id
      }
      ...ProposalDetailLikersLabel_proposal
      ...ProposalDetailLikersModal_proposal
    }
  `,
});
