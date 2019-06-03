// @flow
/* eslint-env jest */
import { graphql } from 'react-relay';
import ProposalFollowButton from './ProposalFollowButton';

describe('<ProposalFollowButton />', () => {
  const proposalViewIsFollowing = {
    id: 'proposal1',
    viewerIsFollowing: true,
    viewerFollowingConfiguration: 'MINIMAL',
  };
  const proposalViewIsNotFollowing = {
    id: 'proposal1',
    viewerIsFollowing: false,
    viewerFollowingConfiguration: null,
  };

  const query = graphql`
    query ProposalFollowButtonTestQuery @relay_test_operation {
      proposal: node(id: "test-id") {
        ...ProposalFollowButton_proposal
      }
    }
  `;

  it('should render a button to unfollow a proposal when viewer is following.', () => {
    expect(
      global.renderWithRelay(ProposalFollowButton, {
        query,
        spec: {
          Proposal() {
            return proposalViewIsFollowing;
          },
        },
      }),
    ).toMatchSnapshot();
  });

  it('should render a button to follow a proposal when viewer is not following.', () => {
    expect(
      global.renderWithRelay(ProposalFollowButton, {
        query,
        spec: {
          Proposal() {
            return proposalViewIsNotFollowing;
          },
        },
      }),
    ).toMatchSnapshot();
  });
});
