import Layout from '../components/Layout/Layout';
import { useIntl } from 'react-intl';
import { Suspense } from 'react';
import AuthenticationMethods from '../components/Authentication/AuthenticationMethods';
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui';
import withPageAuthRequired from '@utils/withPageAuthRequired';

const Authentication = () => {
    const intl = useIntl();

    return (
        <Layout navTitle={intl.formatMessage({ id: 'admin.group.authentication' })}>
            <Suspense
                fallback={
                    <Flex alignItems="center" justifyContent="center">
                        <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
                    </Flex>
                }>
                <AuthenticationMethods />
            </Suspense>
        </Layout>
    );
};

export const getServerSideProps = withPageAuthRequired;

export default Authentication;
