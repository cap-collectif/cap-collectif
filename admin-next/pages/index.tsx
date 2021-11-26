import { NextPage } from 'next';
import { PageProps } from '../types';
import { Text } from '@cap-collectif/ui';
import Layout from '../components/Layout/Layout';
import { useIntl } from 'react-intl';

const Index: NextPage<PageProps> = ({ viewerSession }) => {
    const intl = useIntl();

    return (
        <Layout>
            <Text>
                {intl.formatMessage({ id: 'global-hello' })}: {JSON.stringify(viewerSession)}
            </Text>
        </Layout>
    );
};

export default Index;
