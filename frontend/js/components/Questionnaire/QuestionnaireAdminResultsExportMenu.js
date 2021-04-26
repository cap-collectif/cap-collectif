// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import {useDisclosure} from "@liinkiing/react-hooks";
import Menu from '../DesignSystem/Menu/Menu';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import Text from '~ui/Primitives/Text';
import type { QuestionnaireAdminResultsExportMenu_questionnaire } from '~relay/QuestionnaireAdminResultsExportMenu_questionnaire.graphql';
import type { QuestionTypeValue } from '~relay/QuestionnaireAdminResults_questionnaire.graphql';
import QuestionnaireAdminResultsPdfModal from "~/components/Questionnaire/QuestionnaireAdminResultsPdfModal";
import type {ChartsRef} from "~/components/Questionnaire/QuestionnaireAdminResults";

export type Translations = {|
  +attendee: string,
  +particpationAllowed: string,
  +resultsCollectedBetweenDates: string,
  +keyword: string,
  +occurence: string,
  +tableContent: string,
  +optional: string,
  +noReply: string,
|};

export type QuestionType = {
  +__typename: string,
  +id: string,
  +title: string,
  +type: QuestionTypeValue,
  +required: boolean,
  +private: boolean,
  +participants: {|
    +totalCount: number,
  |},
  +allResponses: {|
    +totalCount: number,
  |},
  +level?: ?number,
  +tagCloud?: $ReadOnlyArray<{|
    +value: string,
    +occurrencesCount: number,
  |}>,
  +imageUrl?: string,
  +translations?: {|
    attendee: string,
    reply: string,
  |},
};

export type QuestionsType = $ReadOnlyArray<QuestionType>;

type Props = {|
  +questionnaire: QuestionnaireAdminResultsExportMenu_questionnaire,
  +logoUrl: string,
  +chartsRef: ChartsRef,
|};

const QuestionnaireAdminResultsExportMenu = ({ questionnaire, logoUrl, chartsRef }: Props) => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  const uniqueChartsRef = [...new Map(chartsRef.map(item =>
    [item.id, item])).values()
  ];

  return (
    <>
      <Menu>
        <Menu.Button as={React.Fragment}>
          <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variant="primary" variantSize="small">
            <FormattedMessage id="global.export" />
          </Button>
        </Menu.Button>
        <Menu.List>
          <Menu.ListItem>
            <Text as="a" href={questionnaire.exportResultsUrl} width="100%" height="100%">
              <FormattedMessage id="spreadsheet-csv" />
            </Text>
          </Menu.ListItem>
          <Menu.ListItem
            // TODO https://github.com/cap-collectif/platform/issues/12532
            onClick={() => {
              setTimeout(() => {
                onOpen();
              }, 100)
            }}
          >
            <Text width="100%" height="100%">
              <FormattedMessage id="pdf-file" />
            </Text>
          </Menu.ListItem>
        </Menu.List>
      </Menu>
      {
        isOpen && (
          <QuestionnaireAdminResultsPdfModal
            onClose={onClose}
            show={isOpen}
            questionnaire={questionnaire}
            logoUrl={logoUrl}
            chartsRef={uniqueChartsRef}
          />
        )
      }
    </>
  );
};

const fragmentContainer = createFragmentContainer(QuestionnaireAdminResultsExportMenu, {
  questionnaire: graphql`
    fragment QuestionnaireAdminResultsExportMenu_questionnaire on Questionnaire {
      exportResultsUrl
      title
      anonymousAllowed
      multipleRepliesAllowed
      participants {
        totalCount
      }
      step {
        timeRange {
          startAt
          endAt
          hasEnded
          isTimeless
        }
        url
      }
      questions {
        __typename
        id
        title
        type
        required
        private
        participants {
          totalCount
        }
        allResponses: responses {
          totalCount
        }
        ... on SectionQuestion {
          level
        }
        ... on SimpleQuestion {
          tagCloud {
            value
            occurrencesCount
          }
        }
      }
    }
  `,
});

export default fragmentContainer;
