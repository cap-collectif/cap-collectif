// @flow
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import ReactPlaceholder from 'react-placeholder';
import type { DebateStepPageFaceToFace_step } from '~relay/DebateStepPageFaceToFace_step.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Heading from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';
import DebateOpinionPlaceholder from '~/components/Debate/Opinion/DebateOpinionPlaceholder';
import DebateOpinion from '~/components/Debate/Opinion/DebateOpinion';
import Button from '~ds/Button/Button';

type Props = {|
  +step: ?DebateStepPageFaceToFace_step,
  +isMobile: boolean,
|};

export const DebateStepPageFaceToFace = ({ step, isMobile }: Props) => {
  const [readMore, setReadMore] = useState(false);
  const debate = step?.debate;
  const opinions = debate?.opinions?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean);
  const forOpinion = opinions?.find(o => o.type === 'FOR');
  const againstOpinion = opinions?.find(o => o.type === 'AGAINST');
  if (!forOpinion || !againstOpinion) {
    return null;
  }
  const hasMore =
    !isMobile && ((againstOpinion?.body.length || 0) > 500 || (forOpinion?.body.length || 0) > 500);

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
        {forOpinion && againstOpinion ? (
          <>
            <Flex direction={['column', 'row']} spacing={6}>
              <DebateOpinion isMobile={isMobile} opinion={forOpinion} readMore={readMore} />
              <DebateOpinion isMobile={isMobile} opinion={againstOpinion} readMore={readMore} />
            </Flex>
            {hasMore && (
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
            )}
          </>
        ) : null}
      </ReactPlaceholder>
    </AppBox>
  );
};

export default createFragmentContainer(DebateStepPageFaceToFace, {
  step: graphql`
    fragment DebateStepPageFaceToFace_step on DebateStep {
      debate {
        opinions {
          edges {
            node {
              ...DebateOpinion_opinion
              type
              body
            }
          }
        }
      }
    }
  `,
});
