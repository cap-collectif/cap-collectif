import { graphql, useLazyLoadQuery } from 'react-relay';
import type { SectionIdentificationCodesQuery } from '@relay/SectionIdentificationCodesQuery.graphql';
import IdentificationCodesLists from './IdentificationCodesLists';
import IdentificationCodesEmpty from './IdentificationCodesEmpty';
import { ConnectionHandler } from 'relay-runtime';

const QUERY = graphql`
    query SectionIdentificationCodesQuery {
        viewer {
            id
            userIdentificationCodeLists(first: 100) {
                totalCount
            }
            ...IdentificationCodesLists_viewer
        }
    }
`;

const SectionIdentificationCodes = () => {
    const query = useLazyLoadQuery<SectionIdentificationCodesQuery>(QUERY, {});
    const connectionName = ConnectionHandler.getConnectionID(
        query.viewer.id,
        'IdentificationCodesListsTable_userIdentificationCodeLists',
    );

    if (query.viewer.userIdentificationCodeLists.totalCount > 0) {
        return <IdentificationCodesLists viewer={query.viewer} connectionName={connectionName} />;
    }

    return <IdentificationCodesEmpty connectionName={connectionName} />;
};

export default SectionIdentificationCodes;
