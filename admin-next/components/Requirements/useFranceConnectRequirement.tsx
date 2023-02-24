import {graphql, useLazyLoadQuery} from "react-relay";
import {FranceConnectAllowedData, useFranceConnectRequirementQuery} from "@relay/useFranceConnectRequirementQuery.graphql";
import {RequirementTypeName} from "@components/Requirements/Requirements";
import useFeatureFlag from "@hooks/useFeatureFlag";

type FranceConnectCollectData = Partial<Record<FranceConnectAllowedData, RequirementTypeName>>

const franceConnectDataMap: FranceConnectCollectData = {
    'given_name': 'FirstnameRequirement',
    'family_name': 'LastnameRequirement',
    'birthdate': 'DateOfBirthRequirement',
}


const QUERY = graphql`
    query useFranceConnectRequirementQuery {
        ssoConfigurations {
            edges {
                node {
                    __typename
                    enabled
                    ...on FranceConnectSSOConfiguration {
                        isCompletelyConfigured
                        allowedData
                    }
                }
            }
        }
    }
`;


export const useFranceConnectRequirement = () => {
    const hasLoginFranceConnect = useFeatureFlag('login_franceconnect');
    const query = useLazyLoadQuery<useFranceConnectRequirementQuery>(QUERY, {});

    const ssoConfigurations = query?.ssoConfigurations?.edges?.map(edge => edge?.node);
    const franceConnect = ssoConfigurations?.find(config => config?.__typename === 'FranceConnectSSOConfiguration');

    const isFranceConnectEnabled = hasLoginFranceConnect && (franceConnect?.enabled && franceConnect.isCompletelyConfigured);
    const collectedFcData = franceConnect?.allowedData
        ?.map((collectedData) => franceConnectDataMap[collectedData] ?? null)
        .filter((data): data is RequirementTypeName => !!data) ?? [];

    return {
        isFranceConnectEnabled,
        collectedFcData
    }
}