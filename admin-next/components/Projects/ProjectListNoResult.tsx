import * as React from 'react';
import { useIntl } from 'react-intl';
import {Heading, Flex, Text, SpotIcon, CapUISpotIcon, CapUISpotIconSize, CapUIIcon, Button} from '@cap-collectif/ui';

const ProjectListNoResult: React.FC = () => {
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
            <SpotIcon name={CapUISpotIcon.PROJECT} size={CapUISpotIconSize.Lg} />
            <Flex direction="column" color="blue.900" align="flex-start" width="300px">
                <Heading as="h3" mb={2}>
                    {intl.formatMessage({ id: 'publish.first.project' })}
                </Heading>
                <Text mb={8}>{intl.formatMessage({ id: 'project.first.description' })}</Text>
                <Button
                    as="a"
                    href="/admin-next/create-project"
                    variant="primary"
                    variantColor="primary"
                    variantSize="big"
                    leftIcon={CapUIIcon.Add}
                    mr={8}
                >
                    {intl.formatMessage({ id: 'create-a-project' })}
                </Button>
            </Flex>
        </Flex>
    );
};

export default ProjectListNoResult;
