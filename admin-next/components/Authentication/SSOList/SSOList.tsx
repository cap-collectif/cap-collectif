import type { FC } from 'react';
import { Grid } from '@cap-collectif/ui';
import CardFacebook from './Facebook/CardFacebook';
import CardMail from './Mail/CardMail';
import CardOpenID from './OpenID/CardOpenID';
import CardFranceConnect from './FranceConnect/CardFranceConnect';
import { graphql, useFragment } from 'react-relay';
import type { SSOList_query$key } from '@relay/SSOList_query.graphql';
import type { CardFacebook_ssoConfiguration$key } from '@relay/CardFacebook_ssoConfiguration.graphql';
import type { CardFranceConnect_ssoConfiguration$key } from '@relay/CardFranceConnect_ssoConfiguration.graphql';
import type { CardOpenID_ssoConfiguration$key } from '@relay/CardOpenID_ssoConfiguration.graphql';
import CardParis from './Paris/CardParis';
import useFeatureFlag from '@hooks/useFeatureFlag';
import { useMemo } from 'react';

type SSOListProps = {
    query: SSOList_query$key,
};
type SSOConfigs = {
    facebook: CardFacebook_ssoConfiguration$key | null,
    franceConnect: CardFranceConnect_ssoConfiguration$key | null,
    openIDs: ({
        id: string
        __typename: string
    } & CardOpenID_ssoConfiguration$key)[],
};

const DEFAULT_SSO_CONFIGS: SSOConfigs = {
    facebook: null,
    franceConnect: null,
    openIDs: [],
};

const FRAGMENT = graphql`
    fragment SSOList_query on Query {
        ssoConfigurations(first: 100) @connection(key: "SSOList_ssoConfigurations") {
            __id
            edges {
                node {
                    id
                    __typename
                    ...CardFacebook_ssoConfiguration
                    ...CardFranceConnect_ssoConfiguration
                    ...CardOpenID_ssoConfiguration
                }
            }
        }
        organizationName: siteParameter(keyname: "global.site.organization_name") {
            ...CardFranceConnect_organizationName
        }
    }
`;

const SSOList: FC<SSOListProps> = ({ query: queryFragment }) => {
    const { ssoConfigurations, organizationName } = useFragment(FRAGMENT, queryFragment);
    const hasSSOParis = useFeatureFlag('login_paris');

    const ssoConfigs: SSOConfigs = useMemo(() => {
        if(!ssoConfigurations.edges) return DEFAULT_SSO_CONFIGS;

        return (
            ssoConfigurations.edges
                .filter(Boolean)
                .map(edge => edge?.node)
                .reduce((acc, node) => {
                    if (node) {
                        if (node?.__typename === 'FacebookSSOConfiguration') {
                            acc.facebook = node;
                        } else if (node?.__typename === 'FranceConnectSSOConfiguration') {
                            acc.franceConnect = node;
                        } else if (['Oauth2SSOConfiguration'].includes(node.__typename)) {
                            acc.openIDs.push(node);
                        }
                    }

                    return acc;
                }, DEFAULT_SSO_CONFIGS)
        );
    }, [ssoConfigurations]);

    return (
        <Grid gap={4} templateColumns="1fr 1fr 1fr" mt={4}>
            <CardMail />
            <CardFacebook
                ssoConfiguration={ssoConfigs.facebook}
                ssoConnectionName={ssoConfigurations.__id}
            />

            <CardFranceConnect
                ssoConfiguration={ssoConfigs.franceConnect}
                ssoConnectionName={ssoConfigurations.__id}
                organizationName={organizationName}
            />

            {ssoConfigs.openIDs.map(
                openIDConfig =>
                    openIDConfig && (
                        <CardOpenID
                            key={openIDConfig.id}
                            ssoConfiguration={openIDConfig}
                            ssoConnectionName={ssoConfigurations.__id}
                        />
                    ),
            )}

            {hasSSOParis && <CardParis />}
        </Grid>
    );
};

export default SSOList;
