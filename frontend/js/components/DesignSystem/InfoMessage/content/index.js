// @flow
import * as React from 'react';
import cn from 'classnames';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

export const INFO_MESSAGE_CONTENT_NAME: 'InfoMessage.Content' = 'InfoMessage.Content';

type InfoMessageContentProps = {|
  ...AppBoxProps,
  children: string | React.Node,
|};

const InfoMessageContent = ({ children, className, ...props }: InfoMessageContentProps) => (
  <AppBox className={cn('info-message-content', className)} fontSize={1} lineHeight="sm" {...props}>
    {children}
  </AppBox>
);

InfoMessageContent.displayName = INFO_MESSAGE_CONTENT_NAME;

export default InfoMessageContent;
