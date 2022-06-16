import { useIntl } from 'react-intl';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { GeographicalAreasListQuery } from '@relay/GeographicalAreasListQuery.graphql';
import {
    Box,
    Heading,
    Flex,
    Text,
    Button,
    ButtonGroup,
    ButtonQuickAction,
    CapUIIcon,
} from '@cap-collectif/ui';
import { useDisclosure } from '@liinkiing/react-hooks';
import { ListCard } from '@ui/ListCard';
import GeographicalAreaDeleteModal from './GeographicalAreaDeleteModal';
import { useState } from 'react';
import GeographicalAreasEmptyPage from './GeographicalAreasEmptyPage';

export const QUERY = graphql`
    query GeographicalAreasListQuery {
        projectDistricts {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
`;

const GeographicalAreasList = () => {
    const intl = useIntl();
    const query = useLazyLoadQuery<GeographicalAreasListQuery>(QUERY, {});
    const { projectDistricts } = query;
    const { isOpen, onOpen, onClose } = useDisclosure(false);
    const [geographicalAreaId, setGeographicalAreaId] = useState<string | null>(null);

    return projectDistricts?.edges?.length ? (
        <Box bg="white" p={6} borderRadius="8px" mb={8}>
            <Heading as="h4" color="blue.800" fontWeight={600} mb={4}>
                {intl.formatMessage({ id: 'areas-list' })}
            </Heading>
            <Flex justify="space-between" spacing={8}>
                <Box maxWidth="375px">
                    <Text color="gray.600" mb={5}>
                        {intl.formatMessage({ id: 'areas-helptext' })}
                    </Text>
                    {/** TODO : create the page 🫠 */}
                    <Button as="a" href="#" variant="primary">
                        {intl.formatMessage({ id: 'add.geographical.area' })}
                    </Button>
                </Box>
                <GeographicalAreaDeleteModal
                    show={isOpen}
                    onClose={onClose}
                    geographicalAreaId={geographicalAreaId}
                />
                <ListCard width="100%">
                    {projectDistricts?.edges
                        ?.filter(Boolean)
                        .map(edge => edge?.node)
                        .filter(Boolean)
                        .map(area => (
                            <ListCard.Item
                                key={area?.id}
                                sx={{ '> div': { opacity: 0 } }}
                                _hover={{ '> div': { opacity: 1 } }}>
                                <ListCard.Item.Label>{area?.name}</ListCard.Item.Label>
                                <ButtonGroup>
                                    <ButtonQuickAction
                                        as="a"
                                        // TODO : create the page 🫣
                                        href="#"
                                        variantColor="blue"
                                        icon={CapUIIcon.Pencil}
                                        label={intl.formatMessage({ id: 'global.edit' })}
                                    />
                                    <ButtonQuickAction
                                        onClick={() => {
                                            setGeographicalAreaId(area?.id || null);
                                            onOpen();
                                        }}
                                        variantColor="red"
                                        icon={CapUIIcon.Trash}
                                        label={intl.formatMessage({ id: 'global.delete' })}
                                    />
                                </ButtonGroup>
                            </ListCard.Item>
                        ))}
                </ListCard>
            </Flex>
        </Box>
    ) : (
        <GeographicalAreasEmptyPage />
    );
};

export default GeographicalAreasList;
