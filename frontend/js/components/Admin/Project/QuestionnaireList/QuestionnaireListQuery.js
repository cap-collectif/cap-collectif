// @flow
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { QUESTIONNAIRE_LIST_PAGINATION } from './QuestionnaireList';
import QuestionnaireListPage, { QuestionnaireListPageQuery } from './QuestionnaireListPage';

type Props = {|
  +isAdmin: boolean,
|};

const QuestionnaireListQueryRender = ({ isAdmin }: Props): React.Node => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader(QuestionnaireListPageQuery);

  React.useEffect(() => {
    loadQuery({
      count: QUESTIONNAIRE_LIST_PAGINATION,
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
    <QuestionnaireListPage queryReference={queryReference} isAdmin={isAdmin} />
  ) : null;
};

export default QuestionnaireListQueryRender;
