// @flow
import React, { useRef, useEffect } from 'react';
import { Box, Flex, Heading, Text, Avatar } from '@cap-collectif/ui';
import { graphql, useFragment, type GraphQLTaggedNode } from 'react-relay';
import { useParams } from 'react-router-dom';
import type { ProposalMapSelectedView_proposal$key } from '~relay/ProposalMapSelectedView_proposal.graphql';
import VoteButton from '../VoteButton';
import { Link } from '../utils';
import { getBaseUrlFromProposalUrl } from '~/utils/router';

type Props = {|
  +proposal: ProposalMapSelectedView_proposal$key,
  +onClose: () => void,
  +stepId: string,
  +disabled: boolean,
|};

const FRAGMENT: GraphQLTaggedNode = graphql`
  fragment ProposalMapSelectedView_proposal on Proposal {
    id
    title
    url
    slug
    summaryOrBodyExcerpt
    author {
      displayName
      media {
        url
      }
    }
  }
`;

const MAX = 175;
const DELTA = MAX / 2;

export const ProposalMapSelectedView = ({ proposal, onClose, stepId, disabled }: Props) => {
  const data = useFragment(FRAGMENT, proposal);
  const myRef = useRef<HTMLElement | null>(null);
  const { projectSlug } = useParams();

  const [prevClientY, setPrevClientY] = React.useState(0);

  const startTouch = (e: TouchEvent) => {
    const card = myRef.current;
    if (card) {
      const initialValue = Number(card.style.transform.match(/-?\d+/)?.[0]);
      setPrevClientY(e.touches[0].clientY + (initialValue === -MAX ? MAX : 0));
    }
  };

  const moveTouch = (e: TouchEvent) => {
    e.preventDefault();
    const currentY = parseInt(e.touches[0].clientY, 10);
    const diffY = prevClientY - currentY;

    const translateValue = diffY > MAX ? MAX : diffY;

    const card = myRef.current;
    if (card) card.style.transform = `translateY(${-translateValue}px)`;
  };

  const endTouch = () => {
    const card = myRef.current;
    if (card) {
      const transformValue = Number(card.style.transform.match(/-?\d+/)?.[0]);
      if (transformValue > DELTA) {
        onClose();
      } else if (-transformValue > DELTA) {
        card.style.transform = `translateY(${-MAX}px)`;
      } else {
        card.style.transform = `translateY(${0}px)`;
      }
    }
    if (card) card.removeEventListener('touchmove', moveTouch, false);
  };

  useEffect(() => {
    let localRef = null;
    if (myRef.current) myRef.current.addEventListener('touchmove', moveTouch, false);
    localRef = myRef.current;
    return () => {
      if (localRef) {
        localRef.removeEventListener('touchmove', moveTouch, false);
      }
    };
  });

  const { author, title, summaryOrBodyExcerpt, id } = data;

  const url = getBaseUrlFromProposalUrl(data.url);

  return (
    <Box
      bg="white"
      position="fixed"
      bottom={`-${MAX}px`}
      zIndex={10}
      width="100%"
      height="327px"
      px={6}
      pb={4}
      borderTopLeftRadius="accordion"
      borderTopRightRadius="accordion"
      boxShadow="big"
      ref={myRef}
      onTouchStart={startTouch}
      onTouchEnd={endTouch}
      sx={{ '*': { textDecoration: 'none !important' } }}>
      <Flex
        width="100%"
        height={9}
        position="relative"
        justifyContent="center"
        alignItems="end"
        pb={4}>
        <Box bg="gray.300" width="6rem" borderRadius="normal" height={1} />
      </Flex>
      <Flex direction="column" width="100%">
        <Link href={`${projectSlug || ''}/${url}/${data.slug}`} stepId={stepId}>
          <Heading as="h3" fontSize={4} color="gray.900" mb={2} truncate={50} lineHeight="initial">
            {title}
          </Heading>
          <Text as="div" fontSize={3} color="gray.700" minHeight="6rem" mb={4} lineHeight="initial">
            {summaryOrBodyExcerpt}
          </Text>
        </Link>
        <Flex justifyContent="space-between" alignItems="start" direction="column" mt={4}>
          <Flex alignItems="center" spacing={2}>
            <Avatar src={author.media?.url} alt={author.displayName} name={author.displayName} />
            <Text as="span" fontSize={2} color="gray.500">
              {author.displayName}
            </Text>
          </Flex>
          <Flex alignItems="center" spacing={4} width="100%" justifyContent="center" my={4}>
            <VoteButton stepId={stepId} proposalId={id} hasVoted={false} disabled={disabled} />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ProposalMapSelectedView;
