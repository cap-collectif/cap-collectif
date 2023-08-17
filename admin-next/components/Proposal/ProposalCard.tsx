import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import QRCode from 'react-qr-code';
import {
    Box,
    Text,
    Card as DsCard,
    Flex,
    Heading,
    Icon,
    CapUIIcon,
    CapUIIconSize,
    Tag,
    BoxProps,
} from '@cap-collectif/ui';
import type { ProposalCard_proposal$key } from '@relay/ProposalCard_proposal.graphql';
import CategoryBackground from './CategoryBackground';
import { useIntl } from 'react-intl';
import convertIconToDs from '@utils/convertIconToDs';
import stripHTML from '@utils/stripHTML';

const FRAGMENT = graphql`
    fragment ProposalCard_proposal on Proposal @argumentDefinitions(stepId: { type: "ID!" }) {
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
        address {
            formatted
        }
        reference
        estimation
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
        currentVotableStep {
            voteType
        }
    }
`;

export const Card: React.FC<BoxProps> = ({ children, className, ...rest }) => (
    <DsCard
        className={`proposalCard ${className}`}
        bg="white"
        py={8}
        px={6}
        justifyContent="center"
        alignItems="center"
        borderRadius="0"
        border="none"
        borderBottom="1px dashed #C4C4C4"
        height="327px"
        {...rest}>
        {children}
    </DsCard>
);

export const ImageContainer = ({ children, url }: { children: React.ReactNode, url: string }) => (
    <Flex justify="center" width="37.3%" position="relative" height="85%">
        <Box
            height="auto"
            margin="0 auto"
            maxWidth="75px"
            width="100%"
            position="absolute"
            right={0}
            bottom={0}
            zIndex={9}
            bg="white"
            borderTopLeftRadius="normal"
            p={1}>
            <QRCode
                size={256}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={url}
                viewBox={`0 0 256 256`}
            />
        </Box>
        <Box width="100%" height="100%" overflow="hidden" borderRadius="normal" position="relative">
            {children}
        </Box>
    </Flex>
);

const IconAndText = ({
    icon,
    children,
    color,
    width,
    justifyContent,
    mr = 0,
    truncateAt,
}: {
    icon: CapUIIcon | null,
    children?: React.ReactNode,
    color?: string | null,
    size?: number,
    width?: string,
    justifyContent?: string,
    mr?: number,
    truncateAt?: number,
}) => (
    <Flex alignItems="center" spacing={0} width={width} justifyContent={justifyContent} mr={mr}>
        {icon ? (
            <Icon size={CapUIIconSize.Md} name={icon} color={color || 'neutral-gray.500'} />
        ) : null}
        {children ? (
            <Text
                as="span"
                fontSize="10px"
                lineHeight="initial"
                color={color || 'neutral-gray.500'}
                truncate={truncateAt ? truncateAt : undefined}>
                {children}
            </Text>
        ) : null}
    </Flex>
);

export const ProposalCard = ({
    proposal: proposalFragment,
    className,
}: {
    className: string,
    proposal: ProposalCard_proposal$key,
}) => {
    const proposal = useFragment(FRAGMENT, proposalFragment);
    const intl = useIntl();

    if (!proposal) return null;

    const {
        media,
        author,
        category,
        title,
        address,
        summary,
        body,
        reference,
        url,
        estimation,
        currentVotableStep,
    } = proposal;

    const showNullEstimation = !!(currentVotableStep && currentVotableStep.voteType === 'BUDGET');

    const summaryOrBodyExcerpt = stripHTML(summary ?? body ?? '') || '';

    const TRUNCATE = 280;

    const tagSx = {
        maxWidth: 'unset !important',
        fontWeight: '800 !important',
        fontSize: '10px !important',
        paddingLeft: '0px !important',
    };

    return (
        <Card className={className}>
            <Flex mb={2} justify="start">
                {address ? (
                    <IconAndText
                        icon={CapUIIcon.PinO}
                        mr={6}
                        truncateAt={100}
                        color="neutral-gray.900">
                        {address.formatted.substring(0, address.formatted.lastIndexOf(','))}
                    </IconAndText>
                ) : null}
                {category ? (
                    <IconAndText
                        truncateAt={100}
                        icon={category.icon ? convertIconToDs(category.icon) : null}
                        color={category.color}
                        size={13}
                        mr={6}>
                        {category.name}
                    </IconAndText>
                ) : null}
            </Flex>
            <Flex
                justify="space-between"
                sx={{ '*': { textDecoration: 'none !important' } }}
                height="100%">
                <Flex direction="column" width="59.7%">
                    <Heading
                        as="h3"
                        fontSize="13px"
                        color="neutral-gray.900"
                        mb={2}
                        lineHeight="initial"
                        fontWeight={800}
                        className="title">
                        {title.slice(0, 80)}
                        {title.length > 80 ? '...' : null}
                    </Heading>
                    <Text
                        as="div"
                        fontSize="11px"
                        color="neutral-gray.900"
                        lineHeight="initial"
                        className="description">
                        {summaryOrBodyExcerpt.slice(0, TRUNCATE)}
                        {summaryOrBodyExcerpt.length > TRUNCATE ? '...' : null}
                    </Text>
                    <Flex justifyContent="space-between" alignItems="center" direction="row" mt={6}>
                        <Flex alignItems="center" spacing={4} justifyContent="start" flex="none">
                            <Flex alignItems="center" spacing={2}>
                                {estimation !== null &&
                                typeof estimation !== 'undefined' &&
                                showNullEstimation ? (
                                    <Tag variantColor="neutral-gray" mr={4} sx={tagSx}>
                                        <Icon
                                            size={CapUIIconSize.Md}
                                            name={CapUIIcon.CoinO}
                                            color="neutral-gray.900"
                                        />
                                        {intl.formatNumber(estimation, { currency: 'EUR' })}€
                                    </Tag>
                                ) : null}
                                {reference ? (
                                    <Tag variantColor="neutral-gray" mr={4} sx={tagSx}>
                                        <Icon
                                            size={CapUIIconSize.Md}
                                            name={CapUIIcon.TagO}
                                            color="neutral-gray.900"
                                        />
                                        REF: {reference}
                                    </Tag>
                                ) : null}
                            </Flex>
                        </Flex>
                        <IconAndText
                            icon={CapUIIcon.UserO}
                            width="65%"
                            color="neutral-gray.900"
                            truncateAt={40}
                            justifyContent="end">
                            {author.displayName.toLocaleLowerCase()}
                        </IconAndText>
                    </Flex>
                </Flex>
                <ImageContainer url={url}>
                    {media ? (
                        <img
                            src={media?.url}
                            alt={media?.name}
                            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                        />
                    ) : (
                        <>
                            {category?.icon ? (
                                <Box
                                    position="absolute"
                                    left="calc(50% - 2rem)"
                                    top="calc(50% - 2rem)">
                                    <Icon
                                        size={CapUIIconSize.Xxl}
                                        name={convertIconToDs(category.icon)}
                                        color="white"
                                    />
                                </Box>
                            ) : null}
                            <CategoryBackground
                                color={category?.color || '#C4C4C4'}
                                viewBox="5 0 240 80"
                                height="100%"
                            />
                        </>
                    )}
                </ImageContainer>
            </Flex>
        </Card>
    );
};

export default ProposalCard;
