import Layout from '../components/Layout/Layout';
import { useIntl } from 'react-intl';
import FeatureList from '../components/FeatureList/FeatureList';

const Features = () => {
    const intl = useIntl();

    return (
        <Layout navTitle={intl.formatMessage({ id: 'admin.label.features' })}>
            <FeatureList />
        </Layout>
    );
};

export default Features;
