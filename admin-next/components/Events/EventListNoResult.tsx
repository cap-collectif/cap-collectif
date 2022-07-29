import {FC} from 'react';
import { useIntl } from 'react-intl';
import {
    Button,
    CapUISpotIcon,
    CapUISpotIconSize,
    CapUIIcon,
    Flex,
    Heading,
    SpotIcon,
    Text,
} from '@cap-collectif/ui';

const EventListNoResult: FC = () => {
    const intl = useIntl();

    return (
        <Flex
            direction="row"
            spacing={8}
            bg="white"
            py="96px"
            px="111px"
            mt={6}
            mx={6}
            borderRadius="normal">
            <SpotIcon name={CapUISpotIcon.CALENDAR} size={CapUISpotIconSize.Lg} />

            <Flex direction="column" color="blue.900" align="flex-start" width="300px">
                <Heading as="h3" mb={2}>
                    {intl.formatMessage({ id: 'admin.event.noresult.heading' })}
                </Heading>
                <Text mb={8}>{intl.formatMessage({ id: 'admin.event.noresult.body' })}</Text>

                <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize="big"
                    leftIcon={CapUIIcon.Add}
                    onClick={() => window.open('/admin/capco/app/event/create', '_self')}>
                    {intl.formatMessage({ id: 'admin-create-event' })}
                </Button>
            </Flex>
        </Flex>
    );
};

export default EventListNoResult;
