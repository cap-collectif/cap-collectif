import type { FC } from 'react';
import { Section } from '@ui/Section';
import { Flex, Link, Text } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { useAppContext } from '../../AppProvider/App.context';
import ModalCreditRefill from './ModalCreditRefill/ModalCreditRefill';
import SmsAnalytics from './SmsAnalytics/SmsAnalytics';
import { graphql, useFragment } from 'react-relay';
import SmsOrderList from './SmsOrderList/SmsOrderList';
import type { SectionSmsTarification_query$key } from '@relay/SectionSmsTarification_query.graphql';

const FRAGMENT = graphql`
    fragment SectionSmsTarification_query on Query {
        ...SmsOrderList_query
        smsAnalytics {
            ...SmsAnalytics_smsAnalytics
        }
    }
`;

type SectionSmsTarificationProps = {
    query: SectionSmsTarification_query$key
}

const SectionSmsTarification: FC<SectionSmsTarificationProps> = ({ query: queryFragment }) => {
    const intl = useIntl();
    const { viewerSession } = useAppContext()
    const query  = useFragment(FRAGMENT, queryFragment);

    return (
        <Section direction="row" spacing={9}>
            <Flex direction="column" flex={1}>
                <Section.Title>{intl.formatMessage({ id: "verification-with-sms" })}</Section.Title>
                <Section.Description>
                    <Text as="span">{intl.formatMessage({ id: "description-service-sms-verification"})}</Text>
                    {' '}
                    <Link href="https://aide.cap-collectif.com/article/270-securisation-du-vote-par-sms" sx={{ textDecoration: "underline"}}>
                        {intl.formatMessage({ id: "learn.more" })}
                    </Link>
                </Section.Description>
            </Flex>

            <Flex direction="column" spacing={4} flex={2}>
                <SmsAnalytics smsAnalytics={query.smsAnalytics} />
                {viewerSession.isSuperAdmin ? <SmsOrderList query={query} /> : <ModalCreditRefill />}
            </Flex>
        </Section>
    )
}

export default SectionSmsTarification;