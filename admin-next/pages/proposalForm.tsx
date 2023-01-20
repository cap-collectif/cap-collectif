import * as React from 'react';
import { useIntl } from 'react-intl';
import { Flex, CapUIIconSize, Spinner } from '@cap-collectif/ui';
import { NextPage } from 'next';
import withPageAuthRequired from '../utils/withPageAuthRequired';
import { PageProps } from '../types';
import Layout from '../components/Layout/Layout';
import ProposalFormListQuery from '../components/ProposalForm/ProposalFormListOldQuery';

const ProposalForm: NextPage<PageProps> = () => {
    const intl = useIntl();

    return (
        <Layout navTitle={intl.formatMessage({ id: 'admin.label.proposal_form' })}>
            <React.Suspense
                fallback={
                    <Flex alignItems="center" justifyContent="center">
                        <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
                    </Flex>
                }>
                <ProposalFormListQuery />
            </React.Suspense>
        </Layout>
    );
};

export const getServerSideProps = withPageAuthRequired;

export default ProposalForm;
