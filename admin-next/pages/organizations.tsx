import * as React from 'react';
import { NextPage } from 'next';
import { Flex, Spinner, CapUIIconSize, Card, Heading, Text } from '@cap-collectif/ui';
import { PageProps } from '../types';
import Layout from '../components/Layout/Layout';
import { useIntl } from 'react-intl';
import withPageAuthRequired from '../utils/withPageAuthRequired';
import CreateOrganizationButton from '../components/Organizations/createOrganizationButton';
import OrganizationList from '../components/Organizations/OrganizationList';

export interface OrganizationPageProps {}

const OrganizationPage: React.FC<OrganizationPageProps> = () => {
    const intl = useIntl();
    return (
        <Flex direction="column" spacing={6}>
            <Flex
                as={Card}
                direction="column"
                spacing={8}
                backgroundColor="white"
                borderRadius="8px">
                <Flex direction="column">
                    <Heading as="h4" fontWeight="bold" color="blue.800">
                        {intl.formatMessage({ id: 'global.general' })}
                    </Heading>
                    <Text color="gray.700">
                        {intl.formatMessage({ id: 'admin.organizations.subtitle' })}
                    </Text>
                </Flex>

                <Flex direction="row">
                    <CreateOrganizationButton />
                    <OrganizationList />
                </Flex>
            </Flex>
        </Flex>
    );
};

const Organizations: NextPage<PageProps> = ({ viewerSession }) => {
    const intl = useIntl();
    return (
        <Layout navTitle={intl.formatMessage({ id: 'global.all.organisation' })}>
            <React.Suspense
                fallback={
                    <Flex alignItems="center" justifyContent="center">
                        <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
                    </Flex>
                }>
                <OrganizationPage />
            </React.Suspense>
        </Layout>
    );
};

export const getServerSideProps = withPageAuthRequired;

export default Organizations;
