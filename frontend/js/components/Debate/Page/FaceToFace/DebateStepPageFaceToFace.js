// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import ReactPlaceholder from 'react-placeholder';
import type { DebateStepPageFaceToFace_step } from '~relay/DebateStepPageFaceToFace_step.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import DebateOpinion from '~/components/Debate/Opinion/DebateOpinion';
import DebateOpinionPlaceholder from '~/components/Debate/Opinion/DebateOpinionPlaceholder';
import Heading from '~ui/Primitives/Heading';

type Props = {|
  +step: ?DebateStepPageFaceToFace_step,
|};

export const DebateStepPageFaceToFace = ({ step }: Props) => {
  const debate = step?.debate;
  const opinions = debate?.opinions?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean);
  const forOpinion = opinions?.find(o => o.type === 'FOR');
  const againstOpinion = opinions?.find(o => o.type === 'AGAINST');
  return (
    <AppBox id={step ? 'DebateStepPageFaceToFace' : 'DebateStepPageFaceToFaceLoading'}>
      <Heading as="h3" fontWeight="400" mb={6}>
        <FormattedMessage id="the.face-to-face" />
      </Heading>
      <ReactPlaceholder
        ready={!!step}
        customPlaceholder={
          <Flex direction={['column', 'row']} spacing={4}>
            <DebateOpinionPlaceholder debateOpinionStatus="FOR" />
            <DebateOpinionPlaceholder debateOpinionStatus="AGAINST" />
          </Flex>
        }>
        {forOpinion && againstOpinion && (
          <Flex direction={['column', 'row']} spacing={4}>
            <DebateOpinion
              title={forOpinion.title}
              authorName={forOpinion.author.username}
              authorPicture={forOpinion.author.media?.url}
              body={forOpinion.body}
              debateOpinionStatus="FOR"
            />
            <DebateOpinion
              title={againstOpinion.title}
              authorName={againstOpinion.author.username}
              authorPicture={againstOpinion.author.media?.url}
              body={againstOpinion.body}
              debateOpinionStatus="AGAINST"
            />
          </Flex>
        )}
      </ReactPlaceholder>
    </AppBox>
  );
};

export default createFragmentContainer(DebateStepPageFaceToFace, {
  step: graphql`
    fragment DebateStepPageFaceToFace_step on DebateStep {
      id
      debate {
        opinions {
          edges {
            node {
              title
              body
              author {
                media {
                  url
                }
                username
              }
              type
            }
          }
        }
      }
    }
  `,
});
