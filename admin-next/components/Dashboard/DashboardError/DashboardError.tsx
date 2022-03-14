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
    CapUIFontWeight,
} from '@cap-collectif/ui';

type DashboardErrorProps = {
    resetErrorBoundary: () => void,
};

const DashboardError: FC<DashboardErrorProps> = ({ resetErrorBoundary }) => {
    const intl = useIntl();

    return (
        <Flex direction="column" spacing="100px">
            <Text
                color="blue.800"
                {...headingStyles.h4}
                fontWeight={CapUIFontWeight.Semibold}
                px={6}
                py={4}
                bg="white">
                {intl.formatMessage({ id: 'dashboard-platform' })}
            </Text>

            <Flex direction="column" align="flex-start" width="75%" margin="0 auto">
                <SpotIcon name={CapUISpotIcon.ERROR} size={CapUISpotIconSize.Lg} mb={2} />
                <Heading as="h2" uppercase={false} color="blue.900" mb={2}>
                    {intl.formatMessage({ id: 'something-went-wrong' })}
                </Heading>
                <Text {...headingStyles.h4} color="blue.900" mb={8}>
                    {intl.formatMessage({ id: 'error-message-dashboard' })}
                </Text>
                <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize="medium"
                    onClick={resetErrorBoundary}>
                    {intl.formatMessage({ id: 'button.try.again' })}
                </Button>
            </Flex>
        </Flex>
    );
};

export default DashboardError;
