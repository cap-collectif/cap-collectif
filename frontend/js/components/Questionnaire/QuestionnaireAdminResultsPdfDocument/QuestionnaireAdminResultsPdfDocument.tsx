import React from 'react'
import { Document, Text, View, Page, Font, StyleSheet } from '@react-pdf/renderer'
import OpenSans from '../../../../../public/fonts/openSans/OpenSans-Regular.ttf'
import OpenSansSemiBold from '../../../../../public/fonts/openSans/OpenSans-SemiBold.ttf'
import type {
  QuestionsType,
  QuestionType,
  Translations,
} from '~/components/Questionnaire/QuestionnaireAdminResultsExportMenu'
import Question from '~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/Question'
import TableContent from '~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/TableContent'
import { convertToAlpha, convertToRoman } from '~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/utils'
import Footer from '~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/Footer'
import CoverPage from '~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/CoverPage'
import colors from '~/styles/modules/colors'
Font.register({
  family: 'OpenSans',
  fonts: [
    {
      src: OpenSans,
      fontWeight: 400,
    },
    {
      src: OpenSansSemiBold,
      fontWeight: 600,
    },
  ],
})
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: 'white',
    justifyContent: 'start',
    padding: 35,
  },
  question_section: {
    color: colors.blue['800'],
    fontSize: 24,
    fontWeight: 400,
    fontFamily: 'OpenSans',
    marginBottom: 8,
  },
  question_subsection: {
    color: colors.gray['700'],
    fontSize: 18,
    fontWeight: 400,
    fontFamily: 'OpenSans',
    marginBottom: 8,
  },
  question_subtitle: {
    color: colors.gray['700'],
    fontSize: 11,
    fontWeight: 400,
    fontFamily: 'OpenSans',
    marginBottom: 8,
  },
})
type Props = {
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
  readonly logoUrl: string
  readonly translations: Translations | null | undefined
}
export type QuestionPdfType = QuestionType & {
  readonly category: 'question' | 'section' | 'subsection'
  readonly position?: number
  readonly sectionIndex?: number
  readonly subSectionIndex?: number
}
export type QuestionsPdfType = ReadonlyArray<QuestionPdfType> | null | undefined

const QuestionnaireAdminResultsPdfDocument = ({ title, step, questions, logoUrl, translations }: Props) => {
  const url = step?.url
  let section = null
  let questionCount: number = 0
  let sectionIndex: number = 1
  let subSectionIndex: number = 0
  const questionsPdf: QuestionsPdfType = questions?.map(question => {
    const { type, level } = question

    if (type === 'section' && level === 0) {
      section = title
      sectionIndex++
      subSectionIndex = 0
      return { ...question, category: 'section', sectionIndex: sectionIndex - 1 }
    }

    if (section !== null && level === 1) {
      subSectionIndex++
      return {
        ...question,
        category: 'subsection',
        subSectionIndex: subSectionIndex - 1,
        sectionIndex: sectionIndex - 1,
      }
    }

    questionCount++
    return { ...question, category: 'question', position: questionCount }
  })
  return (
    <Document>
      <Page style={{ ...styles.page, position: 'relative' }}>
        <CoverPage title={title} logoUrl={logoUrl} url={url} translations={translations} />
      </Page>
      <Page style={styles.page}>
        <TableContent questions={questionsPdf} translations={translations} />
        {/* QUESTIONS START */}
        <View break>
          {questionsPdf?.map((question, index) => {
            if (question?.category === 'section') {
              return (
                <Text key={index} style={styles.question_section}>
                  {convertToRoman(question?.sectionIndex)} . {question?.title}
                </Text>
              )
            }

            if (question?.category === 'subsection') {
              return (
                <Text key={index} style={styles.question_subsection}>
                  {convertToRoman(question?.sectionIndex)} - {convertToAlpha(question?.subSectionIndex)}.{' '}
                  {question?.title}
                </Text>
              )
            }

            if (question?.category === 'question') {
              return <Question key={index} question={question} translations={translations} />
            }
          })}
        </View>
        {/* QUESTIONS END */}
        <Footer logoUrl={logoUrl} title={title} />
      </Page>
    </Document>
  )
}

export default QuestionnaireAdminResultsPdfDocument
