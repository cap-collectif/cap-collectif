// @flow
import * as React from 'react';
import { type IntlShape } from 'react-intl';
import moment from 'moment';
import css from '@styled-system/css';
import type { ProjectCard_project } from '~relay/ProjectCard_project.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import { LineHeight } from '~ui/Primitives/constants';
import Tag, { type TagVariant } from '~ds/Tag/Tag';
import FormattedNumber from '~/components/Utils/FormattedNumber';

export const formatCounter = (iconName: string, count: number) => (
  <Flex direction="row" alignItems="center">
    <Icon name={ICON_NAME[iconName]} size={ICON_SIZE.MD} color="gray.700" mr={1} />
    <Text fontSize={14} color="gray.900">
      <FormattedNumber number={count} />
    </Text>
  </Flex>
);

export const formatInfo = (iconName: string, text: string, color?: string) => (
  <Flex maxWidth="100%" direction="row" alignItems="center" mb={2} mr={2}>
    <Icon name={ICON_NAME[iconName]} size={ICON_SIZE.MD} mr={1} />
    <Text
      as="span"
      css={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color }}>
      {text}
    </Text>
  </Flex>
);

export const renderTag = (
  project: ProjectCard_project,
  intl: IntlShape,
  isProjectsPage: boolean,
) => {
  const restrictedTag = () => (
    <Tag
      variant="neutral-gray"
      css={css({
        p: { lineHeight: 1 },
      })}>
      <Icon name="LOCK" size={ICON_SIZE.SM} color="gray.700" />
    </Tag>
  );

  const tag = (variant: TagVariant, message: string, isRestricted?: boolean) => (
    <Flex
      top={[2, 4]}
      left={[2, 4]}
      css={css({
        position: 'absolute',
      })}>
      <Tag variant={variant} mr={1}>
        <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700">
          {message}
        </Text>
      </Tag>
      {isRestricted && restrictedTag()}
    </Flex>
  );
  const isRestricted = project.visibility !== 'PUBLIC';
  const now = moment();
  const publishedTime = now.diff(moment(project.publishedAt), 'hours');
  if (publishedTime < 0 && isProjectsPage)
    return tag('aqua', intl.formatMessage({ id: 'step.status.future' }), isRestricted);

  if (!project.currentStep) return null;

  const isStepFinished = project.currentStep
    ? project.currentStep.timeless
      ? false
      : project.currentStep.timeRange?.endAt
      ? now.isAfter(moment(project.currentStep.timeRange.endAt))
      : false
    : false;

  if (isStepFinished && isProjectsPage)
    return tag('neutral-gray', intl.formatMessage({ id: 'global.ended' }), isRestricted);
  const hoursLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'hours');
  if (hoursLeft > -48 && isProjectsPage && project.currentStep)
    return tag(
      'red',
      `${-hoursLeft} ${intl.formatMessage({ id: 'count.hoursLeft' }, { count: -hoursLeft })}`,
      isRestricted,
    );
  const daysLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'days');
  if (daysLeft > -7 && isProjectsPage && project.currentStep)
    return tag(
      'orange',
      `${-daysLeft} ${intl.formatMessage({ id: 'count.daysLeft' }, { count: -daysLeft })}`,
      isRestricted,
    );
  if (publishedTime < 48 && isProjectsPage)
    return tag('green', intl.formatMessage({ id: 'global.new' }), isRestricted);
  if (
    (isRestricted &&
      !isStepFinished &&
      !(daysLeft > -7) &&
      !(hoursLeft > -48) &&
      !(publishedTime < 48)) ||
    (isRestricted && !isProjectsPage)
  )
    return (
      <Flex
        top={[2, 4]}
        left={[2, 4]}
        css={css({
          position: 'absolute',
        })}>
        {restrictedTag()}
      </Flex>
    );
};
