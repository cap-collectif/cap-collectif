import type { FC } from 'react';
import { useIntl } from 'react-intl';
import {
    Heading,
    headingStyles,
    Flex,
    Button,
    Text,
    SpotIcon,
    CapUISpotIcon,
    CapUISpotIconSize,
} from '@cap-collectif/ui';
import Layout from '../../Layout/Layout';
import Router from 'next/router';

const DashboardError: FC = () => {
    const intl = useIntl();

    return (
        <Layout
            navTitle={intl.formatMessage({ id: 'dashboard-platform' })}
            navData={[
                {
                    label: intl.formatMessage({ id: 'global.project-dynamic' }, { num: 0 }),
                    number: {
                        color: 'blue.500',
                        label: 0,
                    },
                },
                {
                    label: intl.formatMessage({ id: 'global.in-progress' }),
                    number: {
                        color: 'orange.500',
                        label: 0,
                    },
                },
                {
                    label: intl.formatMessage({ id: 'global.done-dynamic' }, { num: 0 }),
                    number: {
                        color: 'green.500',
                        label: 0,
                    },
                },
            ]}>
            <Flex direction="column" align="flex-start" ml="8%" mt="8%">
                <SpotIcon name={CapUISpotIcon.ERROR} size={CapUISpotIconSize.Lg} mb={2} />
                <Heading as="h2" uppercase={false} color="blue.900" mb={2}>
                    {intl.formatMessage({ id: 'something-went-wrong' })}
                </Heading>
                <Text {...headingStyles.h4} color="blue.900" mb={8} maxWidth="80%">
                    {intl.formatMessage({ id: 'error-message-dashboard' })}
                </Text>
                <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize="medium"
                    onClick={Router.reload}>
                    {intl.formatMessage({ id: 'button.try.again' })}
                </Button>
            </Flex>
        </Layout>
    );
};

export default DashboardError;
