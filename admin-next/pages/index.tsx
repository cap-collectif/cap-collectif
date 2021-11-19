import { NextPage } from 'next';
import { PageProps } from '../types';
import Layout from '../components/Layout/Layout';
import { useIntl } from 'react-intl';

const Index: NextPage<PageProps> = ({ viewerSession }) => {
    const intl = useIntl();

    return (
        <Layout>
            <p style={{ textAlgin: 'center' }}>Bienvenue: {JSON.stringify(viewerSession)}</p>
            {'You can try hot module reloading with: '}
            <a href="/emails">Emails</a>
            {' | '}
            <a href="/dashboard">
                {intl.formatMessage({ id: 'capco.module.unstable__analytics_page' })}
            </a>
        </Layout>
    );
};

export default Index;
