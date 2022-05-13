import { Section } from '@ui/Section';
import { CapUIFontWeight, CapUILineHeight, Card, Flex, Link, Text } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { CountSection } from '@ui/CountSection';
import ModalProcessRequest from './ModalProcessRequest/ModalProcessRequest';
import { useAppContext } from '../../AppProvider/App.context';
import ModalCreditRefill from './ModalCreditRefill/ModalCreditRefill';

const SectionSMSVerification = () => {
    const intl = useIntl();
    const { viewerSession } = useAppContext()

    return (
        <Section direction="row" spacing={9}>
            <Flex direction="column" flex={1}>
                <Section.Title>{intl.formatMessage({ id: "verification-with-sms" })}</Section.Title>
                <Section.Description>
                    <Text as="span">{intl.formatMessage({ id: "description-service-sms-verification"})}</Text>
                    {' '}
                    <Link href="#" sx={{ textDecoration: "underline"}}>
                        {intl.formatMessage({ id: "learn.more" })}
                    </Link>
                </Section.Description>
            </Flex>

            <Flex direction="column" spacing={4} flex={1}>
                <Flex direction="row" spacing={4}>
                    <CountSection variant="blue">
                        <CountSection.Title>
                            {intl.formatMessage({ id: 'remaining-credit' })}
                        </CountSection.Title>
                        <CountSection.Count>
                            1000
                        </CountSection.Count>
                    </CountSection>

                    <CountSection variant="blue">
                        <CountSection.Title>
                            {intl.formatMessage({ id: 'consumed-credit' })}
                        </CountSection.Title>
                        <CountSection.Count>
                            4000
                        </CountSection.Count>
                    </CountSection>

                    <CountSection variant="blue">
                        <CountSection.Title>
                            {intl.formatMessage({ id: 'total-bought' })}
                        </CountSection.Title>
                        <CountSection.Count>
                            5000
                        </CountSection.Count>
                    </CountSection>
                </Flex>

                {viewerSession.isSuperAdmin ? (
                    <Card display="flex" justifyContent="space-between">
                        <Flex direction="column" mr={2}>
                            <Text
                                fontWeight={CapUIFontWeight.Semibold}
                                color="gray.900"
                                fontSize={1}
                                lineHeight={CapUILineHeight.Sm}>
                                {intl.formatMessage({ id: 'global.order' })}
                            </Text>
                            <Text color="gray.900" fontSize={1} lineHeight={CapUILineHeight.Sm}>
                                {intl.formatMessage({ id: 'client-request-pack-credit' }, {
                                    creditCount: 5000,
                                    date: '12/01/2022',
                                })}
                            </Text>
                        </Flex>

                        <ModalProcessRequest/>
                    </Card>
                ) : <ModalCreditRefill />
                }
            </Flex>
        </Section>
    )
}

export default SectionSMSVerification;