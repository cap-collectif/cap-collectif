import * as React from 'react';
import CardOrg from '@ui/CardOrg/CardOrg';
import { Button, Flex, Text } from '@cap-collectif/ui';
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay';
import type { OrganizationListQuery as OrganizationListQueryType } from '@relay/OrganizationListQuery.graphql';
import { useIntl } from 'react-intl';

export interface OrganizationListProps {}
export const QUERY: GraphQLTaggedNode = graphql`
    query OrganizationListQuery(
        $count: Int
        $cursor: String
        $term: String
        $affiliations: [OrganizationAffiliation!]
    ) {
        organizations(after: $cursor, first: $count, search: $term, affiliations: $affiliations) {
            totalCount
            edges {
                node {
                    id
                    title
                    displayName
                    url
                    members {
                        user {
                            _id
                        }
                    }
                    logo {
                        id
                        url
                        description
                    }
                }
            }
        }
    }
`;

const OrganizationList: React.FC<OrganizationListProps> = () => {
    const intl = useIntl();
    const query = useLazyLoadQuery<OrganizationListQueryType>(QUERY, {
        count: 50,
        cursor: null,
        term: null,
        affiliations: null,
    });
    const organizations = query.organizations?.edges
        ?.filter(Boolean)
        .map(edge => edge?.node)
        .filter(Boolean);

    return (
        <>
            {organizations &&
                organizations.map(organization => {
                    const memberCount = organization?.members?.length;
                    const hasLogo = !!organization?.logo;
                    return (
                        <CardOrg key={organization?.id} marginBottom={4} marginRight={4}>
                            <CardOrg.Header>
                                {hasLogo ? (
                                    <img
                                        src={organization?.logo?.url}
                                        alt={organization?.logo?.description || ''}
                                    />
                                ) : (
                                    <Text textAlign="center">{organization?.title}</Text>
                                )}
                            </CardOrg.Header>
                            <CardOrg.Body>
                                <Text>
                                    {intl.formatMessage(
                                        { id: 'organizations.members' },
                                        { num: memberCount },
                                    )}
                                </Text>
                                <Button
                                    onClick={() => {
                                        window.open(
                                            `/organizationConfig/${organization?.id}`,
                                            '_self',
                                        );
                                    }}
                                    variant="tertiary"
                                    variantColor="primary">
                                    {intl.formatMessage({ id: 'global.handle' })}
                                </Button>
                            </CardOrg.Body>
                        </CardOrg>
                    );
                })}
        </>
    );
};

export default OrganizationList;
