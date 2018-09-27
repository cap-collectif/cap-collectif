// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { injectIntl, type IntlShape } from 'react-intl';
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
  intl: IntlShape,
};

export class ProposalDetailLikers extends React.Component<Props> {
  static defaultProps = {
    componentClass: 'a',
  };

  handleClick = (e: SyntheticEvent<HTMLButtonElement>) => {
    const { dispatch, proposal } = this.props;
    e.preventDefault();
    dispatch(openDetailLikersModal(proposal.id));
  };

  render() {
    const { proposal, componentClass, showModal, intl } = this.props;
    const Component = componentClass;

    if (proposal.likers.length === 0) {
      return null;
    }

    return (
      <React.Fragment>
        <Component
          className="tags-list__tag"
          title={intl.formatMessage({ id: 'list-of-favorites' })}
          onClick={this.handleClick}>
          {/* $FlowFixMe */}
          <ProposalDetailLikersLabel proposal={proposal} />
        </Component>
        {/* $FlowFixMe */}
        <ProposalDetailLikersModal show={showModal} proposal={proposal} />
      </React.Fragment>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  showModal:
    state.proposal.showDetailLikersModal &&
    state.proposal.showDetailLikersModal === props.proposal.id,
});

const container = connect(mapStateToProps)(injectIntl(ProposalDetailLikers));

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
