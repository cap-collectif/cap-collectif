// @flow
import * as React from 'react';
import cn from 'classnames';
import Text, { type TextProps } from '~ui/Primitives/Text';

export const INFO_MESSAGE_CONTENT_NAME: 'InfoMessageContent' = 'InfoMessageContent';

type InfoMessageContentProps = {|
  ...TextProps,
  children: string,
|};

const InfoMessageContent = ({ children, className, ...props }: InfoMessageContentProps) => (
  <Text className={cn('info-message-content', className)} {...props}>
    {children}
  </Text>
);

InfoMessageContent.displayName = 'InfoMessage.Content';

export default InfoMessageContent;
