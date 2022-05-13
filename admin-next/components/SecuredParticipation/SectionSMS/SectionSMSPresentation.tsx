import type { FC } from 'react';
import { Section } from '@ui/Section';
import { useIntl } from 'react-intl';
import {
    Box,
    Button,
    CapUIIcon,
    CapUIIconSize,
    CapUILineHeight,
    CapUISpotIcon,
    CapUISpotIconSize,
    Flex,
    Icon,
    SpotIcon,
    Text,
} from '@cap-collectif/ui';
import useFeatureFlag from '@hooks/useFeatureFlag';

const SectionSMSPresentation: FC = () => {
    const intl = useIntl();
    const hasTwilioEnabled = useFeatureFlag('twilio');

    return (
        <Section direction="row" justify="space-between" align="center">
            <Box>
                <Section.Title>
                    {intl.formatMessage({ id: "verification-with-sms" })}
                </Section.Title>
                <Section.Description mb={4}>
                    {intl.formatMessage({ id: "verification-with-sms" })}
                </Section.Description>

                <Box mb={5}>
                    <Flex spacing={1} align="center">
                        <Icon name={CapUIIcon.CheckO} size={CapUIIconSize.Md} color="blue.500" />
                        <Text color="gray.900" lineHeight={CapUILineHeight.S} fontSize={3}>
                            {intl.formatMessage({ id: "check-phone-number" })}
                        </Text>
                    </Flex>

                    <Flex spacing={1} align="center">
                        <Icon name={CapUIIcon.CheckO} size={CapUIIconSize.Md} color="blue.500" />
                        <Text color="gray.900" lineHeight={CapUILineHeight.S} fontSize={3}>
                            {intl.formatMessage({ id: "send-verification-code-sms" })}
                        </Text>
                    </Flex>
                </Box>

                <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize="small"
                    disabled={!hasTwilioEnabled}>
                    {intl.formatMessage({ id: "action_enable" })}
                </Button>
            </Box>

            <SpotIcon name={CapUISpotIcon.SMS} size={CapUISpotIconSize.Lg} />
        </Section>
    );
}

export default SectionSMSPresentation;