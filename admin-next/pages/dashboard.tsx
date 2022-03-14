import { NextPage } from 'next';
import { PageProps } from '../types';
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui';
import withPageAuthRequired from '../utils/withPageAuthRequired';
import { Suspense } from 'react';
import DashboardContainer from '../components/Dashboard/DashboardContainer';

const Dashboard: NextPage<PageProps> = () => (
    <Suspense
        fallback={
            <Flex alignItems="center" justifyContent="center">
                <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
        }>
        <DashboardContainer />
    </Suspense>
);

export const getServerSideProps = withPageAuthRequired;

export default Dashboard;
