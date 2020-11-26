// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import Flex from '~ui/Primitives/Layout/Flex';
import Heading from '~ui/Primitives/Heading';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import AppBox from '~ui/Primitives/AppBox';
import Text from '~ui/Primitives/Text';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import Card from '~ds/Card/Card';

export const DebateArticleCardTitle: StyledComponent<{}, {}, typeof Heading> = styled(
  Heading,
).attrs(props => ({
  mt: 0,
  mb: 1,
  fontSize: 3,
  truncate: props.truncate ?? 165,
  lineHeight: 'base',
  color: props.color ?? 'gray.900',
}))``;

export const DebateArticleCardDescription: StyledComponent<{}, {}, typeof Text> = styled(
  Text,
).attrs(props => ({
  color: props.color ?? 'gray.900',
  mb: 1,
}))``;

export const DebateArticleCardOrigin: StyledComponent<{}, {}, typeof Text> = styled(Text).attrs(
  props => ({
    color: props.color ?? 'gray.900',
  }),
)``;

type Props = {|
  ...AppBoxProps,
  +illustration?: string,
  +publishedAt?: string,
|};

const DebateArticleCard = ({ children, illustration, publishedAt, ...props }: Props) => {
  return (
    <Card p={0} flexDirection="column" overflow="hidden" {...props}>
      <AppBox overflow="hidden" bg="red.300" height={14}>
        {illustration ? (
          <AppBox
            src="https://picsum.photos/536/354"
            width="100%"
            height="100%"
            as="img"
            css={{ objectFit: 'cover' }}
          />
        ) : (
          <Flex justify="center" align="center" width="100%" height="100%" bg="neutral-gray.150">
            <Icon name={ICON_NAME.NEWSPAPER} size={ICON_SIZE.XXL} color="gray.500" />
          </Flex>
        )}
      </AppBox>
      <AppBox px={4} py={2} bg="white">
        {children}
        {publishedAt && (
          <Text color="gray.500" fontSize={3} mt={1}>
            {publishedAt}
          </Text>
        )}
      </AppBox>
    </Card>
  );
};

DebateArticleCard.displayName = 'DebateArticleCard';
DebateArticleCardDescription.displayName = 'DebateArticleCard.Description';
DebateArticleCardOrigin.displayName = 'DebateArticleCard.Origin';
DebateArticleCardTitle.displayName = 'DebateArticleCard.Title';

DebateArticleCard.Title = DebateArticleCardTitle;
DebateArticleCard.Description = DebateArticleCardDescription;
DebateArticleCard.Origin = DebateArticleCardOrigin;

export default DebateArticleCard;
