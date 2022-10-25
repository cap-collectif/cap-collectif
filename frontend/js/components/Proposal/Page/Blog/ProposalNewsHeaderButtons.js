// @flow
import React, { useState } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Flex, Button } from '@cap-collectif/ui';
import environment, { graphqlError } from '~/createRelayEnvironment';
import Loader from '~ui/FeedbacksIndicators/Loader';
import type { Uuid } from '~/types';
import type {
  ProposalNewsHeaderButtonsQueryVariables,
  ProposalNewsHeaderButtonsQueryResponse,
} from '~relay/ProposalNewsHeaderButtonsQuery.graphql';
import ProposalNewsEditModal from '~/components/Proposal/Page/Blog/ProposalNewsEditModal';

type Props = {|
  postId: Uuid,
|};

const ProposalNewsHeaderButtons = ({ postId }: Props) => {
  const [showModal, displayModal] = useState(false);
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query ProposalNewsHeaderButtonsQuery($postId: ID!) {
          post: node(id: $postId) {
            ... on Post {
              ...ProposalNewsEditModal_post
            }
          }
        }
      `}
      variables={({ postId }: ProposalNewsHeaderButtonsQueryVariables)}
      render={({
        error,
        props,
      }: {
        ...ReactRelayReadyState,
        props: ?ProposalNewsHeaderButtonsQueryResponse,
      }) => {
        if (error) return graphqlError;

        if (props && props.post) {
          return (
            <Flex maxWidth="690px" width="100%" margin="auto" px={11}>
              <Button
                id="edit-proposal-news"
                leftIcon="PENCIL"
                variant="secondary"
                variantColor="primary"
                variantSize="small"
                onClick={() => displayModal(true)}>
                <FormattedMessage id="global.edit" />
              </Button>
              <ProposalNewsEditModal
                post={props.post}
                show={showModal}
                displayModal={displayModal}
              />
            </Flex>
          );
        }

        return <Loader />;
      }}
    />
  );
};

export default ProposalNewsHeaderButtons;
