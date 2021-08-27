// @flow
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { PROPOSAL_FORM_LIST_PAGINATION } from './ProposalFormList';
import ProposalFormListPage, { ProposalFormListPageQuery } from './ProposalFormListPage';

type Props = {|
  +isAdmin: boolean,
|};

const ProposalFormListQueryRender = ({ isAdmin }: Props): React.Node => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader(ProposalFormListPageQuery);

  React.useEffect(() => {
    loadQuery({
      count: PROPOSAL_FORM_LIST_PAGINATION,
      cursor: null,
      term: null,
      affiliations: isAdmin ? null : ['OWNER'],
      orderBy: { field: 'CREATED_AT', direction: 'DESC' },
    });

    return () => {
      disposeQuery();
    };
  }, [disposeQuery, loadQuery, isAdmin]);

  return queryReference ? (
    <ProposalFormListPage queryReference={queryReference} isAdmin={isAdmin} />
  ) : null;
};

export default ProposalFormListQueryRender;
