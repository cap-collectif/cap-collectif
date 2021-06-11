import { FC } from 'react';
import { FlexProps } from '../../Ui/Primitives/Layout/Flex';
import InfoMessageTitle from './title';
import InfoMessageContent from './content';

export type InfoMessageProps = FlexProps & {
    readonly variant: 'info' | 'infoGray' | 'danger' | 'success' | 'warning',
};

declare const InfoMessage: FC<InfoMessageProps> & {
    Title: typeof InfoMessageTitle;
    Content: typeof InfoMessageContent;
};

export default InfoMessage
