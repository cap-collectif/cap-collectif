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

export const renderTag = (project: ProjectCard_project, intl: IntlShape) => {
  const tag = (variant: TagVariant, message: string) => (
    <Tag
      top={[2, 4]}
      left={[2, 4]}
      variant={variant}
      css={css({
        position: 'absolute',
      })}>
      <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700">
        {message}
      </Text>
    </Tag>
  );

  const now = moment();
  if (now.diff(moment(project.publishedAt), 'hours') < 48)
    return tag('green', intl.formatMessage({ id: 'global.new' }));
  if (!project.currentStep) return null;

  const isStepFinished = project.currentStep.timeless
    ? false
    : project.currentStep.timeRange?.endAt
    ? now.isAfter(moment(project.currentStep.timeRange.endAt))
    : false;

  if (isStepFinished) return tag('neutral-gray', intl.formatMessage({ id: 'global.ended' }));
  const hoursLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'hours');
  if (hoursLeft > -48)
    return tag(
      'red',
      `${-hoursLeft} ${intl.formatMessage({ id: 'count.hoursLeft' }, { count: -hoursLeft })}`,
    );
  const daysLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'days');
  if (daysLeft > -7)
    return tag(
      'orange',
      `${-daysLeft} ${intl.formatMessage({ id: 'count.daysLeft' }, { count: -daysLeft })}`,
    );
};
