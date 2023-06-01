// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  Box,
  Text,
  Card as DsCard,
  Flex,
  Heading,
  useTheme,
  Avatar,
  Icon,
  CapUIIcon,
  CapUIIconSize,
  Tag,
} from '@cap-collectif/ui';
import type { ProposalPreviewCard_proposal$key } from '~relay/ProposalPreviewCard_proposal.graphql';
import Image from '~/components/Ui/Primitives/Image';
import CategoryBackground from '~/components/Ui/Medias/CategoryBackground';
import { Icon as OldIcon } from '~ui/Icons/Icon';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import useIsMobile from '~/utils/hooks/useIsMobile';
import VoteButton from '../VoteButton';
import { getBaseUrlFromProposalUrl } from '~/utils/router';
import { Link, ACTIVE_COLOR, VoteStepEvent, dispatchEvent } from '../utils';

const FRAGMENT = graphql`
  fragment ProposalPreviewCard_proposal on Proposal @argumentDefinitions(stepId: { type: "ID!" }) {
    id
    title
    url
    slug
    summary
    body
    author {
      displayName
      media {
        url
      }
    }
    district {
      name
    }
    category {
      name
      color
      icon
    }
    media {
      url
      name
    }
    votes {
      totalCount
    }
    status(step: $stepId) {
      name
    }
  }
`;

export const Card = ({ children, ...rest }: {| children: React.Node, ...AppBoxProps |}) => (
  <DsCard
    bg="white"
    p={6}
    mb={[6, 4]}
    justify="center"
    alignItems="center"
    borderRadius="accordion"
    border="none"
    minHeight={['unset']}
    {...rest}>
    {children}
  </DsCard>
);

export const ImageContainer = ({ children }: {| children: React.Node |}) => (
  <Flex justify="center" width="50%" display={['none', 'none', 'none', 'flex']}>
    <Box height="19rem" width="28.5rem" overflow="hidden" borderRadius="normal" position="relative">
      {children}
    </Box>
  </Flex>
);

const IconAndText = ({
  icon,
  children,
  color,
  size,
  width,
  justifyContent,
  useOldIcons = false,
  mr = 0,
  truncate = false,
}: {|
  icon: string | null,
  children?: React.Node,
  color?: string | null,
  size?: number,
  width?: string,
  justifyContent?: string,
  mr?: number,
  useOldIcons?: boolean,
  truncate?: boolean,
|}) => {
  const { colors } = useTheme();
  return (
    <Flex alignItems="center" spacing={1} width={width} justifyContent={justifyContent} mr={mr}>
      {icon ? (
        useOldIcons ? (
          <OldIcon name={icon} size={size || 13} color={colors.gray[500]} />
        ) : (
          <Icon size={CapUIIconSize.Md} name={icon} color="gray.500" />
        )
      ) : null}
      {children ? (
        <Text
          as="span"
          fontSize={2}
          color={color || 'gray.500'}
          truncate={truncate ? 30 : undefined}>
          {children}
        </Text>
      ) : null}
    </Flex>
  );
};

export const ProposalPreviewCard = ({
  proposal: proposalFragment,
  showImage,
  isHighlighted,
  hasVoted,
  stepId,
  disabled,
}: {|
  +proposal: ?ProposalPreviewCard_proposal$key,
  +showImage?: boolean,
  +isHighlighted?: boolean,
  +hasVoted: boolean,
  +stepId: string,
  +disabled: boolean,
|}) => {
  const intl = useIntl();
  const isMobile = useIsMobile();
  const proposal = useFragment(FRAGMENT, proposalFragment);
  const { projectSlug } = useParams();

  if (!proposal) return null;

  const { media, author, category, title, district, summary, body, votes, status } = proposal;

  const url = getBaseUrlFromProposalUrl(proposal.url);

  const summaryOrBodyExcerpt = summary ?? body ?? '';

  const TRUNCATE = 285;

  return (
    <Card
      boxShadow={['small', isHighlighted ? '0 10px 30px rgba(0, 0, 0, 0.15)' : 'unset']}
      id={`proposal-${proposal.id}`}
      onMouseEnter={() => dispatchEvent(VoteStepEvent.HoverCardStart, { id: proposal.id })}
      onMouseLeave={() => dispatchEvent(VoteStepEvent.HoverCardEnd)}>
      <Flex justify="space-between" sx={{ '*': { textDecoration: 'none !important' } }}>
        <Flex
          direction="column"
          width={['100%', '100%', '100%', showImage ? 'calc(50% - 4rem)' : '100%']}>
          <Flex mb={2} justify={['space-between', 'start']} flexWrap="wrap">
            {status ? (
              <Tag variantColor="red" mr={4} sx={{ maxWidth: 'unset !important' }}>
                {status.name}
              </Tag>
            ) : null}
            {district ? (
              <IconAndText icon={CapUIIcon.PinO} mr={6} truncate>
                {district.name}
              </IconAndText>
            ) : null}
            {category ? (
              <IconAndText
                truncate
                useOldIcons
                icon={category?.icon || null}
                size={isMobile ? 16 : 13}
                mr={isMobile ? 0 : 6}>
                {isMobile ? null : category.name}
              </IconAndText>
            ) : null}
          </Flex>
          <Link href={`${projectSlug || ''}/${url}/${proposal.slug}`} stepId={stepId}>
            <Heading
              as="h3"
              fontSize={4}
              color={['gray.900', '#CE237F']}
              mb={2}
              lineHeight="initial">
              {title}
            </Heading>
            <Text
              as="div"
              fontSize={3}
              color="gray.700"
              sx={{ span: { textDecoration: 'underline !important' } }}
              lineHeight="initial">
              {summaryOrBodyExcerpt.slice(0, TRUNCATE)}
              {summaryOrBodyExcerpt.length > TRUNCATE ? (
                <>
                  {'... '}
                  <span>{intl.formatMessage({ id: 'capco.module.read_more' })}</span>
                </>
              ) : null}
            </Text>
          </Link>
          <Flex
            justifyContent="space-between"
            alignItems={['start', 'center']}
            direction={['column-reverse', 'row']}
            mt={[4, 6]}>
            <Flex
              alignItems="center"
              spacing={4}
              width={['100%', '']}
              justifyContent={['center', 'start']}
              mt={[6, 0]}>
              <VoteButton
                hasVoted={hasVoted}
                stepId={stepId}
                proposalId={proposal.id}
                disabled={disabled}
              />
              <Flex
                alignItems="center"
                spacing={2}
                display={[
                  'none',
                  showImage ? 'flex' : 'none',
                  showImage ? 'flex' : 'none',
                  'flex',
                ]}>
                <IconAndText icon={CapUIIcon.HeartO} color="gray.700" size={16}>
                  {votes?.totalCount || '0'}
                </IconAndText>
              </Flex>
            </Flex>
            {isMobile ? (
              <Flex alignItems="center" spacing={2}>
                <Avatar
                  src={author.media?.url}
                  alt={author.displayName}
                  name={author.displayName}
                />
                <Text as="span" fontSize={2} color="gray.500">
                  {author.displayName}
                </Text>
              </Flex>
            ) : (
              <IconAndText icon={CapUIIcon.UserO} color="gray.700" width="50%" justifyContent="end">
                {author.displayName}
              </IconAndText>
            )}
          </Flex>
        </Flex>
        {showImage ? (
          <ImageContainer>
            <Link href={`${projectSlug || ''}/${url}/${proposal.slug}`} stepId={stepId}>
              {media ? (
                <Image
                  src={media?.url}
                  alt={media?.name}
                  height="100%"
                  width="100%"
                  objectFit="cover"
                />
              ) : (
                <>
                  {category?.icon ? (
                    <Box position="absolute" left="calc(50% - 1.4rem)" top="calc(50% - 1.4rem)">
                      <OldIcon name={category?.icon} size={40} color="white" />
                    </Box>
                  ) : null}
                  <CategoryBackground
                    color={category?.color || ACTIVE_COLOR}
                    viewBox="5 0 240 80"
                    height="100%"
                  />
                </>
              )}
            </Link>
          </ImageContainer>
        ) : null}
      </Flex>
    </Card>
  );
};

export default ProposalPreviewCard;
