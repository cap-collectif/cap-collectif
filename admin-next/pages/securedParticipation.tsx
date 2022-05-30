import { NextPage } from 'next';
import { PageProps } from '../types';
import React, { Suspense } from 'react';
import { Flex } from '@cap-collectif/ui';
import Layout from '../components/Layout/Layout';
import Loader from '~ui/FeedbacksIndicators/Loader';
import { useIntl } from 'react-intl';
import withPageAuthRequired from '../utils/withPageAuthRequired';
import SectionSms from '../components/SecuredParticipation/SectionSMS/SectionSms';
import SectionIdentificationCodes from '../components/SecuredParticipation/SectionIdentificationCodes/SectionIdentificationCodes';

const SecuredParticipation: NextPage<PageProps> = () => {
    const intl = useIntl();

    return (
        <Layout navTitle={intl.formatMessage({ id: 'secured-participation' })}>
            <Flex direction="column" spacing={6}>
                <Suspense fallback={<Loader />}>
                    <SectionSms />
                </Suspense>

                <Suspense fallback={<Loader />}>
                    <SectionIdentificationCodes />
                </Suspense>
            </Flex>
        </Layout>
    );
};

export const getServerSideProps = withPageAuthRequired;

export default SecuredParticipation;
