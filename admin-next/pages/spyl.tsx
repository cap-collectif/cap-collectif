import { NextPage } from 'next';
import { PageProps } from '../types';
import Layout from '../components/Layout/Layout';
import { Text } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import withPageAuthRequired from '../utils/withPageAuthRequired';

const Spyl: NextPage<PageProps> = ({ viewerSession }) => {
    const intl = useIntl();

    return (
        <Layout
            navTitle="Brouillon"
            navData={{}}
        >
            <Text>
                {intl.formatMessage({ id: 'global-draft' })}
            </Text>
            <Link href="/">
                <a>Go to home</a>
            </Link>
        </Layout>
    );
};

export const getServerSideProps = withPageAuthRequired;

export default Spyl;
