import type { FC } from 'react';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import {
    CapUISpotIcon,
    CapUISpotIconSize,
    Flex,
    headingStyles,
    SpotIcon,
    Text,
    Step,
} from '@cap-collectif/ui';

type ModalDownloadListProps = Step & {
    codesCount: number,
};

const ModalDownloadList: FC<ModalDownloadListProps> = ({ codesCount }) => {
    const intl = useIntl();

    return (
        <Flex direction="column" align="center" textAlign="center" color="gray.900">
            <SpotIcon name={CapUISpotIcon.CODES} size={CapUISpotIconSize.Lg} />
            <Text {...headingStyles.h4} my={4}>
                <FormattedHTMLMessage
                    id="identification-codes-associated-to-each-one"
                    values={{
                        count: codesCount,
                    }}
                />
            </Text>
            <Text {...headingStyles.h4}>
                {intl.formatMessage({
                    id: 'download-and-send-codes-before-enable',
                })}
            </Text>
        </Flex>
    );
};

export default ModalDownloadList;
