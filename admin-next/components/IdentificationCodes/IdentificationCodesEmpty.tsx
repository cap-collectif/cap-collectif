import {
    Box,
    CapUIIcon,
    CapUISpotIcon,
    CapUISpotIconSize,
    Flex,
    Icon,
    SpotIcon,
    Text,
} from '@cap-collectif/ui';
import { FC } from 'react';
import { useIntl } from 'react-intl';
import IdentificationCodesListCreationModal from './CreationModal/IdentificationCodesListCreationModal';
import { Section } from '@ui/Section';
import HelpButton from './HelpButton';

const IdentificationCodesEmpty: FC<{
    connectionName: string;
}> = ({ connectionName }) => {
    const intl = useIntl();
    return (
        <Section>
            <Section.Title>{intl.formatMessage({ id: 'identification-code-check' })}</Section.Title>
            <Section.Description>
                {intl.formatMessage({ id: 'identification-code-check-help-first' })}
            </Section.Description>
            <Flex direction="row" align="center" justify="space-between">
                <Flex direction="column">
                    <Flex direction="row" align="center">
                        <Icon name={CapUIIcon.CheckO} color="blue.500" />
                        <Text as="span">{intl.formatMessage({ id: 'import-list' })}</Text>
                    </Flex>
                    <Flex direction="row" align="center">
                        <Icon name={CapUIIcon.CheckO} color="blue.500" />
                        <Text as="span">
                            {intl.formatMessage({ id: 'identification-code-generate' })}
                        </Text>
                    </Flex>
                    <Flex direction="row" align="center">
                        <Icon name={CapUIIcon.CheckO} color="blue.500" />
                        <Text as="span">{intl.formatMessage({ id: 'download-updated-list' })}</Text>
                    </Flex>
                </Flex>
                <SpotIcon name={CapUISpotIcon.MAIL} size={CapUISpotIconSize.Lg} />
            </Flex>
            <Flex direction="row">
                <IdentificationCodesListCreationModal connectionName={connectionName} isFirst />
                <HelpButton />
            </Flex>
        </Section>
    );
};

export default IdentificationCodesEmpty;
