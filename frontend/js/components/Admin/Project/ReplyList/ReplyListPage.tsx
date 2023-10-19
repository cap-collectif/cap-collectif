import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { useHistory } from 'react-router-dom'
import Flex from '~ui/Primitives/Layout/Flex'
import ReplyList from './ReplyList'
import type { ReplyListPage_questionnaireStep$key } from '~relay/ReplyListPage_questionnaireStep.graphql'
import Input from '~ui/Form/Input/Input'
import Button from '~ds/Button/Button'
import Loader from '~ui/FeedbacksIndicators/Loader'
import ReplyListPlaceholder from './ReplyListPlaceholder'
import { ICON_NAME as ICON_NAME_DS } from '~ds/Icon/Icon'
type Props = {
  readonly questionnaireStep: ReplyListPage_questionnaireStep$key
  readonly hasContributionsStep: boolean
  readonly baseUrl: string
}
const FRAGMENT = graphql`
  fragment ReplyListPage_questionnaireStep on QuestionnaireStep
  @argumentDefinitions(
    countRepliesPagination: { type: "Int!" }
    cursorRepliesPagination: { type: "String" }
    repliesTerm: { type: "String" }
    repliesOrderBy: { type: "ReplyOrder" }
    repliesFilterStatus: { type: "[ReplyStatus]" }
  ) {
    questionnaire {
      allReplies: replies {
        totalCount
      }
      exportResultsUrl
      ...ReplyList_questionnaire
        @arguments(
          countRepliesPagination: $countRepliesPagination
          cursorRepliesPagination: $cursorRepliesPagination
          repliesTerm: $repliesTerm
          repliesOrderBy: $repliesOrderBy
          repliesFilterStatus: $repliesFilterStatus
        )
    }
  }
`

const ReplyListPage = ({ questionnaireStep: stepFragment, hasContributionsStep, baseUrl }: Props): JSX.Element => {
  const intl = useIntl()
  const history = useHistory()
  const [term, setTerm] = React.useState<string>('')
  const step = useFragment(FRAGMENT, stepFragment)
  if (!step) return <Loader />
  return (
    <>
      {hasContributionsStep && baseUrl && (
        <Button
          variant="tertiary"
          onClick={() => history.push(baseUrl)}
          leftIcon={ICON_NAME_DS.LONG_ARROW_LEFT}
          size="small"
          ml={6}
          mb={2}
        >
          {intl.formatMessage({
            id: 'global.steps',
          })}
        </Button>
      )}
      <Flex direction="column" p={8} spacing={4} m={6} bg="white" borderRadius="normal" overflow="hidden">
        <Flex justifyContent="space-between">
          <Input
            type="text"
            name="term"
            id="search-questionnaire"
            onChange={(e: React.SyntheticEvent<HTMLInputElement>) => setTerm(e.target.value)}
            value={term}
            placeholder={`${intl.formatMessage({
              id: 'search.by.author',
            })}...`}
          />
          <Button
            variant="secondary"
            variantSize="small"
            onClick={() => {
              if (step?.questionnaire?.exportResultsUrl) {
                window.location.href = step?.questionnaire?.exportResultsUrl
              }
            }}
          >
            {intl.formatMessage({
              id: 'global.export',
            })}
          </Button>
        </Flex>
        <React.Suspense fallback={<ReplyListPlaceholder />}>
          {step?.questionnaire && (
            <ReplyList questionnaire={step?.questionnaire} resetTerm={() => setTerm('')} term={term} />
          )}
        </React.Suspense>
      </Flex>
    </>
  )
}

export default ReplyListPage
