import * as React from 'react';
import { useIntl } from 'react-intl';
import {
    Flex,
    Heading,
    SpotIcon,
    CapUISpotIcon,
    CapUISpotIconSize,
    CapUIIcon,
    Text,
    Button,
} from '@cap-collectif/ui';

const GeographicalAreasEmptyPage: React.FC = () => {
    const intl = useIntl();

    return (
        <Flex direction="row" spacing={8} bg="white" py="96px" px="111px" borderRadius="normal">
            <SpotIcon name={CapUISpotIcon.MAP} size={CapUISpotIconSize.Lg} />

            <Flex direction="column" color="blue.900" align="flex-start" maxWidth="330px">
                <Heading as="h3" mb={2}>
                    {intl.formatMessage({ id: 'create-your-first-zone' })}
                </Heading>
                <Text mb={8} fontSize={18}>
                    {intl.formatMessage({ id: 'zone-create-text' })}
                </Text>
                {/* TODO : create the page 🫥 */}
                <Button as="a" leftIcon={CapUIIcon.Add} href="#" variantSize="big">
                    {intl.formatMessage({ id: 'create-zone' })}
                </Button>
            </Flex>
        </Flex>
    );
};

export default GeographicalAreasEmptyPage;
