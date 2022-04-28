import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { Flex, Heading, SpotIcon, CapUISpotIcon, CapUISpotIconSize, Text } from '@cap-collectif/ui';
import ModalCreateQuestionnaire from './ModalCreateQuestionnaire';
import type { QuestionnaireListNoResult_viewer$key } from '@relay/QuestionnaireListNoResult_viewer.graphql';

const FRAGMENT = graphql`
    fragment QuestionnaireListNoResult_viewer on User {
        ...ModalCreateQuestionnaire_viewer
    }
`;

type QuestionnaireListNoResultProps = {
    viewer: QuestionnaireListNoResult_viewer$key,
    term: string,
    orderBy: string,
    hasQuestionnaire: boolean,
};

const QuestionnaireListNoResult: React.FC<QuestionnaireListNoResultProps> = ({
    viewer: viewerFragment,
    term,
    orderBy,
    hasQuestionnaire,
}) => {
    const intl = useIntl();
    const viewer = useFragment<QuestionnaireListNoResult_viewer$key>(FRAGMENT, viewerFragment);

    return (
        <Flex direction="row" spacing={8} bg="white" py="96px" px="111px" borderRadius="normal">
            <SpotIcon name={CapUISpotIcon.QUESTIONNAIRE} size={CapUISpotIconSize.Lg} />

            <Flex direction="column" color="blue.900" align="flex-start" maxWidth="300px">
                <Heading as="h3" mb={2}>
                    {intl.formatMessage({ id: 'publish-first-questionnaire' })}
                </Heading>
                <Text mb={8}>{intl.formatMessage({ id: 'questionnaire-description' })}</Text>

                <ModalCreateQuestionnaire
                    viewer={viewer}
                    term={term}
                    orderBy={orderBy}
                    hasQuestionnaire={hasQuestionnaire}
                    noResult
                />
            </Flex>
        </Flex>
    );
};

export default QuestionnaireListNoResult;
