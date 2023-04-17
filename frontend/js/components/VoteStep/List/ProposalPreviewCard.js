// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { Box, Text, Card as DsCard, Flex, Heading, useTheme, Tag, Avatar } from '@cap-collectif/ui';
import type { ProposalPreviewCard_proposal$key } from '~relay/ProposalPreviewCard_proposal.graphql';
import Image from '~/components/Ui/Primitives/Image';
import CategoryBackground from '~/components/Ui/Medias/CategoryBackground';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import useIsMobile from '~/utils/hooks/useIsMobile';

const FRAGMENT = graphql`
  fragment ProposalPreviewCard_proposal on Proposal {
    id
    title
    url
    summaryOrBodyExcerpt
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
    comments {
      totalCount
    }
    votes {
      totalCount
    }
    status {
      name
    }
  }
`;

const DEFAULT_COLOR = '#299033';
const DISTRICT_COLOR = '#2F6A35';

export const Card = ({ children, ...rest }: {| children: React.Node, ...AppBoxProps |}) => (
  <DsCard
    bg="white"
    p={6}
    pb={[4, 6]}
    mb={[6, 4]}
    justify="center"
    alignItems="center"
    borderRadius="accordion"
    border="none"
    height={['unset', '22.5rem']}
    {...rest}>
    {children}
  </DsCard>
);

export const ImageContainer = ({ children }: {| children: React.Node |}) => (
  <Flex justify="center" width="50%">
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
}: {|
  icon: string | null,
  children?: React.Node,
  color?: string | null,
  size?: number,
|}) => {
  const { colors } = useTheme();
  return (
    <Flex alignItems="center" spacing={1}>
      {icon ? <Icon name={icon} size={size || 13} color={colors.gray[500]} /> : null}
      {children ? (
        <Text as="span" fontSize={2} color={color || 'gray.500'}>
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
}: {|
  +proposal: ?ProposalPreviewCard_proposal$key,
  +showImage?: boolean,
  +isHighlighted?: boolean,
|}) => {
  const isMobile = useIsMobile();
  const proposal = useFragment(FRAGMENT, proposalFragment);

  if (!proposal) return null;

  const {
    media,
    status,
    author,
    category,
    title,
    district,
    summaryOrBodyExcerpt,
    votes,
    comments,
  } = proposal;

  return (
    <Card
      boxShadow={['medium', isHighlighted ? '0 10px 30px rgba(0, 0, 0, 0.15)' : '']}
      height={['unset', '22.5rem']}
      id={`proposal-${proposal.id}`}>
      <Flex justify="space-between">
        <Flex direction="column" width={showImage ? 'calc(50% - 4rem)' : '100%'}>
          <Flex mb={2} spacing={6} justify={['space-between', 'start']}>
            {status && !isMobile ? (
              <Tag variantColor="green">
                <Tag.Label>{status.name}</Tag.Label>
              </Tag>
            ) : null}
            {district ? (
              <IconAndText icon={ICON_NAME.pin} color={isMobile ? DISTRICT_COLOR : null}>
                {district.name}
              </IconAndText>
            ) : null}
            {category ? (
              <IconAndText icon={category?.icon || null} size={isMobile ? 16 : 13}>
                {isMobile ? null : category.name}
              </IconAndText>
            ) : null}
          </Flex>
          <Heading as="h3" fontSize={4} color="gray.900" mb={2}>
            {title}
          </Heading>
          <Text as="div" fontSize={3} color="gray.700" mb={[4, 6]}>
            {summaryOrBodyExcerpt}
          </Text>
          <Flex
            justifyContent="space-between"
            alignItems={['start', 'center']}
            direction={['column-reverse', 'row']}>
            <Flex
              alignItems="center"
              spacing={4}
              width={['100%', '']}
              justifyContent={['center', 'start']}
              mt={[6, 0]}>
              <div>TODO votebtn</div>
              <Flex alignItems="center" spacing={2} display={['none', 'flex']}>
                <IconAndText icon={ICON_NAME.love} color="gray.700" size={16}>
                  {votes.totalCount || '0'}
                </IconAndText>
                <IconAndText icon={ICON_NAME.conversation} color="gray.700" size={16}>
                  {comments.totalCount || '0'}
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
              <IconAndText icon={ICON_NAME.user} color="gray.700">
                {author.displayName}
              </IconAndText>
            )}
          </Flex>
        </Flex>
        {showImage ? (
          <ImageContainer>
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
                  <Box position="absolute" left="calc(50% - 1rem)" top="calc(50% - 1rem)">
                    <Icon name={category?.icon} size={28} color="white" />
                  </Box>
                ) : null}
                <CategoryBackground
                  color={category?.color || DEFAULT_COLOR}
                  viewBox="5 0 240 80"
                  height="100%"
                />
              </>
            )}
          </ImageContainer>
        ) : null}
      </Flex>
    </Card>
  );
};

export default ProposalPreviewCard;
