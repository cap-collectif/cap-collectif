import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import { useDisclosure } from '@liinkiing/react-hooks'
import Menu from '../DesignSystem/Menu/Menu'
import Button from '~ds/Button/Button'
import { ICON_NAME } from '~ds/Icon/Icon'
import Text from '~ui/Primitives/Text'
import type { QuestionnaireAdminResultsExportMenu_questionnaire } from '~relay/QuestionnaireAdminResultsExportMenu_questionnaire.graphql'
import type { QuestionTypeValue } from '~relay/QuestionnaireAdminResults_questionnaire.graphql'
import QuestionnaireAdminResultsPdfModal from '~/components/Questionnaire/QuestionnaireAdminResultsPdfModal'
import type { ChartsRef } from '~/components/Questionnaire/QuestionnaireAdminResults'
export type Translations = {
  readonly attendee: string
  readonly particpationAllowed: string
  readonly resultsCollectedBetweenDates: string
  readonly keyword: string
  readonly occurence: string
  readonly tableContent: string
  readonly optional: string
  readonly noReply: string
}
export type QuestionType = {
  readonly __typename: string
  readonly id: string
  readonly title: string
  readonly type: QuestionTypeValue
  readonly required: boolean
  readonly private: boolean
  readonly participants: {
    readonly totalCount: number
  }
  readonly allResponses: {
    readonly totalCount: number
  }
  readonly level?: number | null | undefined
  readonly tagCloud?: ReadonlyArray<{
    readonly value: string
    readonly occurrencesCount: number
  }>
  readonly imageUrl?: string
  readonly translations?: {
    attendee: string
    reply: string
  }
}
export type QuestionsType = ReadonlyArray<QuestionType>
type Props = {
  readonly questionnaire: QuestionnaireAdminResultsExportMenu_questionnaire
  readonly logoUrl: string
  readonly chartsRef: ChartsRef
}

const QuestionnaireAdminResultsExportMenu = ({ questionnaire, logoUrl, chartsRef }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const uniqueChartsRef = [...new Map(chartsRef.filter(item => item.ref).map(item => [item.id, item])).values()]
  return (
    <>
      <Menu>
        <Menu.Button>
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
            onClick={() => {
              onOpen()
            }}
            closeOnSelect={false}
          >
            <Text width="100%" height="100%">
              <FormattedMessage id="pdf-file" />
            </Text>
          </Menu.ListItem>
        </Menu.List>
      </Menu>
      {isOpen && (
        <QuestionnaireAdminResultsPdfModal
          onClose={onClose}
          show={isOpen}
          questionnaire={questionnaire}
          logoUrl={logoUrl}
          chartsRef={uniqueChartsRef}
        />
      )}
    </>
  )
}

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
})
export default fragmentContainer
