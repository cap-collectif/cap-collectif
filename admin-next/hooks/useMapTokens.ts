import { useLazyLoadQuery, graphql } from 'react-relay';
import invariant from '../utils/invariant';
import { useMapTokensQuery } from '@relay/useMapTokensQuery.graphql';

const query = graphql`
    query useMapTokensQuery {
        mapToken(provider: MAPBOX) {
            publicToken
            styleId
            styleOwner
        }
    }
`;

export const useMapTokens = () => {
    const data = useLazyLoadQuery<useMapTokensQuery>(query, {}, { fetchPolicy: 'store-only' });
    invariant(data.mapToken !== undefined, 'mapTokens are missing in Relay store.');
    return data.mapToken;
};

export default useMapTokens;
