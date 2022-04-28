import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import { Table, Link } from '@cap-collectif/ui';
import ModalConfirmationDelete from './ModalConfirmationDelete';
import type { QuestionnaireItem_questionnaire$key } from '@relay/QuestionnaireItem_questionnaire.graphql';
import { useAppContext } from '../AppProvider/App.context';

type QuestionnaireItemProps = {
    questionnaire: QuestionnaireItem_questionnaire$key,
    connectionName: string,
};

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
        owner {
            username
        }
        ...ModalConfirmationDelete_questionnaire
    }
`;

const QuestionnaireItem: React.FC<QuestionnaireItemProps> = ({
    questionnaire: questionnaireFragment,
    connectionName,
}) => {
    const { viewerSession } = useAppContext();
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
            {viewerSession.isAdmin && <Table.Td>{questionnaire.owner?.username}</Table.Td>}
            <Table.Td>
                {intl.formatDate(questionnaire.updatedAt ?? undefined, {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                })}
            </Table.Td>
            <Table.Td>
                {intl.formatDate(questionnaire.createdAt ?? undefined, {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                })}
            </Table.Td>
            <Table.Td visibleOnHover>
                <ModalConfirmationDelete
                    questionnaire={questionnaire}
                    connectionName={connectionName}
                />
            </Table.Td>
        </>
    );
};

export default QuestionnaireItem;
