import React, { useEffect } from 'react'
import { usePDF } from '@react-pdf/renderer'
import moment from 'moment'
import { useIntl } from 'react-intl'
import saveAs from '@shared/utils/filesaver'
import QuestionnaireAdminResultsPdfDocument from '~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/QuestionnaireAdminResultsPdfDocument'
import type { QuestionsType, Translations } from '~/components/Questionnaire/QuestionnaireAdminResultsExportMenu'
type Props = {
  readonly logoUrl: string
  readonly title: string
  readonly step:
    | {
        readonly timeRange: {
          readonly startAt: string | null | undefined
          readonly endAt: string | null | undefined
          readonly hasEnded: boolean
          readonly isTimeless: boolean
        }
        readonly url: string
      }
    | null
    | undefined
  readonly questions: QuestionsType | null | undefined
  readonly translations: Translations | null | undefined
  readonly setLoading: (arg0: boolean) => void
  readonly setError: (arg0: boolean) => void
}

const QuestionnaireAdminResultsPdfInstance = ({
  logoUrl,
  title,
  step,
  questions,
  translations,
  setLoading,
  setError,
}: Props) => {
  const intl = useIntl()
  const resultsText = intl.formatMessage({
    id: 'results',
  })
  const today = moment().format('DD_MM_YY')
  const filenameTitle = title.toLowerCase().split(' ').join('-')
  const filename = `${resultsText}_${filenameTitle}_${today}.pdf`
  const [instance] = usePDF({
    document: (
      <QuestionnaireAdminResultsPdfDocument
        logoUrl={logoUrl}
        title={title}
        step={step}
        questions={questions}
        translations={translations}
      />
    ),
  })
  useEffect(() => {
    if (instance.blob !== null) {
      saveAs(instance.blob, filename)
      setLoading(false)
      setError(false)
    }
  }, [instance.blob, setLoading, setError, filename])
  useEffect(() => {
    if (instance.error) {
      setError(true)
      setLoading(false)
    }
  }, [instance.error, setError, setLoading])
  return null
}

export default QuestionnaireAdminResultsPdfInstance
