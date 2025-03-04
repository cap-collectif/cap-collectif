import * as React from 'react';
import type { IntlShape } from 'react-intl';
import 'react-intl';
import moment from 'moment';
import css from '@styled-system/css';
import type { ProjectCard_project$data } from '~relay/ProjectCard_project.graphql';
import { LineHeight } from '~ui/Primitives/constants';
import FormattedNumber from '~/components/Utils/FormattedNumber';
import colors from '~/styles/modules/colors';
import { Flex, Text, Tag, TagProps, CapUIIconSize, CapUIIcon, Icon } from '@cap-collectif/ui';
import { pxToRem } from '@shared/utils/pxToRem';

export const formatCounter = (
    iconName: CapUIIcon,
    count: number,
    archived: boolean,
    label?: string,
) => (
    <Flex direction="row" alignItems="center">
        <Icon
            size={CapUIIconSize.Md}
            color={archived ? 'gray.500' : 'gray.700'}
            mr={1}
            name={iconName}
        />
        <Text fontSize={14} color={archived ? 'gray.500' : 'gray.900'} as="div">
            <FormattedNumber number={count} />
            <span className="sr-only">{label}</span>
        </Text>
    </Flex>
);

export const formatInfo = (
    iconName: CapUIIcon,
    text: string | null | undefined,
    archived: boolean,
    color?: string,
) => {
    if (!text) {
        return null;
    }

    return (
        <Flex maxWidth="100%" direction="row" alignItems="center" mb={2} mr={2}>
            <Icon name={iconName} size={CapUIIconSize.Md} mr={1} />
            <Text
                as="span"
                css={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: archived ? colors['neutral-gray']['400'] : color,
                }}>
                {text}
            </Text>
        </Flex>
    );
};

export const renderTag = (
    project: ProjectCard_project$data,
    intl: IntlShape,
    isLargeCard: boolean = false,
) => {
    const restrictedTag = () => (
        <Tag
            variantColor="neutral-gray"
            css={css({
                p: {
                    lineHeight: 1,
                },
            })}>
            <Icon size={CapUIIconSize.Sm} name={CapUIIcon.Lock} color="gray.700" />
        </Tag>
    );

    const tag = (
        icon: CapUIIcon | null,
        variant: TagProps['variantColor'],
        message: string,
        isRestricted?: boolean,
    ) => (
        <Flex
            top={isLargeCard ? pxToRem(16) : pxToRem(-36)}
            left={isLargeCard ? pxToRem(16) : 0}
            position="absolute">
            <Tag variantColor={variant} mr={1} sx={{ maxWidth: 'unset !important' }}>
                {icon ? <Tag.LeftIcon name={icon || CapUIIcon.Add} /> : null}
                <Text as="span" fontSize={2} lineHeight={LineHeight.SM} fontWeight="700">
                    {message}
                </Text>
            </Tag>
            {isRestricted && restrictedTag()}
        </Flex>
    );

    if (project.archived)
        return tag(
            null,
            'neutral-gray',
            intl.formatMessage({
                id: 'global-archived',
            }),
        );
    const isRestricted = project.visibility !== 'PUBLIC';
    const now = moment();
    const publishedTime = now.diff(moment(project.publishedAt), 'hours');

    if (project.status === 'UNKNOWN') return null;
    if (project.status === 'FUTURE_WITHOUT_FINISHED_STEPS')
        return tag(
            CapUIIcon.CalendarO,
            'aqua',
            intl.formatMessage({
                id: 'step.status.future',
            }),
            isRestricted,
        );
    const isClosed = project.status === 'CLOSED';
    if (isClosed)
        return tag(
            null,
            'neutral-gray',
            intl.formatMessage({
                id: 'global.ended',
            }),
            isRestricted,
        );
    const hoursLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'hours');
    if (hoursLeft > -48 && project.currentStep)
        return tag(
            CapUIIcon.ClockO,
            'red',
            `${-hoursLeft} ${intl.formatMessage(
                {
                    id: 'count.hoursLeft',
                },
                {
                    count: -hoursLeft,
                },
            )}`,
            isRestricted,
        );
    const daysLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'days');
    if (daysLeft > -7 && project.currentStep)
        return tag(
            CapUIIcon.ClockO,
            'orange',
            `${-daysLeft} ${intl.formatMessage(
                {
                    id: 'count.daysLeft',
                },
                {
                    count: -daysLeft,
                },
            )}`,
            isRestricted,
        );
    if (project.status === 'OPENED')
        return tag(
            CapUIIcon.HourglassO,
            'green',
            intl.formatMessage({
                id: 'global.in-progress',
            }),
            isRestricted,
        );
    if (project.status === 'OPENED_PARTICIPATION')
        return tag(
            CapUIIcon.BubbleO,
            'green',
            intl.formatMessage({
                id: 'step.status.open.participation',
            }),
            isRestricted,
        );
    if (
        (isRestricted &&
            !isClosed &&
            !(daysLeft > -7) &&
            !(hoursLeft > -48) &&
            !(publishedTime < 48)) ||
        isRestricted
    )
        return (
            <Flex
                top={isLargeCard ? pxToRem(16) : pxToRem(-36)}
                left={isLargeCard ? pxToRem(16) : 0}
                position="absolute">
                {restrictedTag()}
            </Flex>
        );
};
