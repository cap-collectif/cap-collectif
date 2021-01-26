// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { OpinionPageLogic_query } from '~relay/OpinionPageLogic_query.graphql';
import Heading from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';

export type Props = {|
  query: ?OpinionPageLogic_query,
  isAuthenticated: boolean,
|};

const OpinionPageLogic = ({ query }: Props) => {
  const opinion = query?.opinion ?? null;
  if (!opinion) return null;
  return (
    <Flex>
      <Heading>{opinion.title}</Heading>
    </Flex>
  );
};

export default createFragmentContainer(OpinionPageLogic, {
  query: graphql`
    fragment OpinionPageLogic_query on Query
      @argumentDefinitions(opinionId: { type: "ID!" }, isAuthenticated: { type: "Boolean!" }) {
      opinion: node(id: $opinionId) {
        ... on Opinion {
          title
        }
      }
    }
  `,
});
