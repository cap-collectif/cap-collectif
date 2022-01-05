import { graphql, useLazyLoadQuery } from 'react-relay';
import { FC } from 'react';
import IdentificationCodesLists from './IdentificationCodesLists';
import IdentificationCodesEmpty from './IdentificationCodesEmpty';
import { IdentificationCodesContentQuery } from '@relay/IdentificationCodesContentQuery.graphql';

const QUERY = graphql`
    query IdentificationCodesContentQuery {
        viewer {
            userIdentificationCodeLists(first: 100)
                @connection(key: "IdentificationCodes_userIdentificationCodeLists", filters: []) {
                __id
                edges {
                    node {
                        id
                        name
                        codesCount
                        alreadyUsedCount
                    }
                }
                totalCount
            }
        }
    }
`;

const IdentificationCodesContent: FC = () => {
    const { viewer } = useLazyLoadQuery<IdentificationCodesContentQuery>(QUERY, {});
    return viewer.userIdentificationCodeLists?.edges?.filter(Boolean).length > 0 ? (
        <IdentificationCodesLists
            lists={viewer.userIdentificationCodeLists.edges}
            connectionName={viewer.userIdentificationCodeLists.__id}
        />
    ) : (
        <IdentificationCodesEmpty connectionName={viewer.userIdentificationCodeLists.__id} />
    );
};

export default IdentificationCodesContent;
