import { useIntl } from 'react-intl';
import Section from '../../../UI/Section/Section';
import { CapUILineHeight, Flex, Text } from '@cap-collectif/ui';

const SectionTopContributorsEmpty = () => {
    const intl = useIntl();

    return (
        <Section spacing={6}>
            <Section.Title>{intl.formatMessage({ id: 'most-active-contributors' })}</Section.Title>

            <Flex direction="column" align="center" py={6} spacing={1}>
                <Text
                    color="gray.900"
                    fontSize={2}
                    lineHeight={CapUILineHeight.Sm}
                    textAlign="center">
                    {intl.formatMessage({ id: 'no-data-found-date-range' })}
                </Text>
                <Text color="gray.800" fontSize={1} lineHeight={CapUILineHeight.Sm}>
                    {intl.formatMessage({ id: 'please-select-another-period' })}
                </Text>
            </Flex>
        </Section>
    );
};

export default SectionTopContributorsEmpty;
