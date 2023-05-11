// @flow
import React, { useState, type Node } from 'react';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Box, Skeleton, Button, Flex, Heading } from '@cap-collectif/ui';
import type { DebateStepPageFaceToFace_step } from '~relay/DebateStepPageFaceToFace_step.graphql';
import DebateOpinionPlaceholder from '~/components/Debate/Opinion/DebateOpinionPlaceholder';
import DebateOpinion from '~/components/Debate/Opinion/DebateOpinion';

type Props = {|
  +step: ?DebateStepPageFaceToFace_step,
  +isMobile: boolean,
|};

export const DebateStepPageFaceToFace = ({ step, isMobile }: Props): Node => {
  const [readMore, setReadMore] = useState(false);
  const debate = step?.debate;
  const opinions = debate?.opinions?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean);
  const forOpinion = opinions?.find(o => o.type === 'FOR');
  const againstOpinion = opinions?.find(o => o.type === 'AGAINST');
  if (debate && (!forOpinion || !againstOpinion)) {
    return null;
  }
  const hasMore =
    !isMobile && ((againstOpinion?.body.length || 0) > 500 || (forOpinion?.body.length || 0) > 500);

  return (
    <Box id={step ? 'DebateStepPageFaceToFace' : 'DebateStepPageFaceToFaceLoading'}>
      <Heading as="h3" fontWeight="400" mb={6}>
        <FormattedMessage id="the.face-to-face" />
      </Heading>

      <Skeleton
        isLoaded={!!step}
        placeholder={
          <Flex direction={['column', 'row']} spacing={4}>
            <DebateOpinionPlaceholder debateOpinionStatus="FOR" />
            <DebateOpinionPlaceholder debateOpinionStatus="AGAINST" />
          </Flex>
        }>
        {forOpinion && againstOpinion ? (
          <>
            <Flex direction={['column', 'row']} spacing={6}>
              <DebateOpinion
                isMobile={isMobile}
                opinion={forOpinion}
                readMore={readMore || !hasMore}
              />
              <DebateOpinion
                isMobile={isMobile}
                opinion={againstOpinion}
                readMore={readMore || !hasMore}
              />
            </Flex>
            {hasMore && (
              <Flex width="100%" justify="center">
                <Button
                  onClick={() => setReadMore(!readMore)}
                  variant="link"
                  variantColor="primary"
                  variantSize="small"
                  rightIcon="ARROW_DOWN_O"
                  m="auto"
                  mt={7}>
                  <FormattedMessage
                    tagName={React.Fragment}
                    id={readMore ? 'read-less-opinions' : 'capco.module.read_more'}
                  />
                </Button>
              </Flex>
            )}
          </>
        ) : null}
      </Skeleton>
    </Box>
  );
};

export default (createFragmentContainer(DebateStepPageFaceToFace, {
  step: graphql`
    fragment DebateStepPageFaceToFace_step on DebateStep
    @argumentDefinitions(isMobile: { type: "Boolean!" }) {
      debate {
        opinions {
          edges {
            node {
              ...DebateOpinion_opinion @arguments(isMobile: $isMobile)
              type
              body
            }
          }
        }
      }
    }
  `,
}): RelayFragmentContainer<typeof DebateStepPageFaceToFace>);
