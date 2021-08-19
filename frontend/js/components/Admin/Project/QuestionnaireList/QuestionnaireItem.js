// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Table from '~ds/Table';
import ModalConfirmationDelete from './ModalConfirmationDelete';
import type { QuestionnaireItem_questionnaire$key } from '~relay/QuestionnaireItem_questionnaire.graphql';
import Link from '~ds/Link/Link';

type Props = {|
  questionnaire: QuestionnaireItem_questionnaire$key,
  connectionName: string,
|};

const FRAGMENT = graphql`
  fragment QuestionnaireItem_questionnaire on Questionnaire {
    title
    adminUrl
    createdAt
    updatedAt
    step {
      project {
        title
        adminAlphaUrl
      }
    }
    ...ModalConfirmationDelete_questionnaire
  }
`;

const QuestionnaireItem = ({
  questionnaire: questionnaireFragment,
  connectionName,
}: Props): React.Node => {
  const questionnaire = useFragment(FRAGMENT, questionnaireFragment);
  const intl = useIntl();

  return (
    <>
      <Table.Td>
        <Link href={questionnaire.adminUrl}>{questionnaire.title}</Link>
      </Table.Td>
      <Table.Td>
        {questionnaire?.step?.project ? (
          <Link href={questionnaire.step.project.adminAlphaUrl}>
            {questionnaire.step.project.title}
          </Link>
        ) : (
          questionnaire?.step?.project?.title
        )}
      </Table.Td>
      <Table.Td>
        {intl.formatDate(questionnaire.updatedAt, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td>
        {intl.formatDate(questionnaire.createdAt, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td>
        <ModalConfirmationDelete questionnaire={questionnaire} connectionName={connectionName} />
      </Table.Td>
    </>
  );
};

export default QuestionnaireItem;
