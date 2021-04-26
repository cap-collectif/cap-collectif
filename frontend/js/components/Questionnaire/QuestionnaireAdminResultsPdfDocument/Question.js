// @flow
import React from 'react'
import {Image, Text, View, StyleSheet} from "@react-pdf/renderer";
import TagsTable from "~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/TagsTable";
import colors from '~/styles/modules/colors';
import type {QuestionPdfType} from './QuestionnaireAdminResultsPdfDocument'
import type {Translations} from "~/components/Questionnaire/QuestionnaireAdminResultsExportMenu";

const styles = StyleSheet.create({
  question_title: {
    color: colors.gray['900'],
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'OpenSans',
    marginBottom: 5,
  },
  question_subtitle: {
    color: colors.gray['700'],
    fontSize: 11,
    fontWeight: 400,
    fontFamily: 'OpenSans',
    marginBottom: 8,
  },
  facultative: {
    fontFamily: 'OpenSans',
    color: colors.gray['500'],
    fontSize: 13,
    fontWeight: 400,
  }
})

type Props = {
  question: ?QuestionPdfType,
  translations: ?Translations
}


const Question = ({question, translations}: Props) => {
  return (
    <View wrap={false} style={{marginBottom: 35 }}>
      <Text style={styles.question_title}>
        {question?.position}. {question?.title} &nbsp; { question?.required === false && <Text style={styles.facultative}>{translations?.optional}</Text> }
      </Text>
      {
        question?.participants?.totalCount !== 0 && question?.allResponses?.totalCount !== 0 ?
          (
            <Text style={styles.question_subtitle}>
              {question?.translations?.attendee} / {question?.translations?.reply}
            </Text>
          ) : (
            <Text style={styles.question_subtitle}>{translations?.noReply}</Text>
          )
      }
      {
        question?.imageUrl &&
        <Image src={question?.imageUrl}/>
      }
      {
        question?.__typename === 'SimpleQuestion' && question?.tagCloud && question?.tagCloud?.length > 0 && (
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <TagsTable tags={question?.tagCloud?.slice(0, Math.ceil(question?.tagCloud.length / 2))} translations={translations} />
            <TagsTable tags={question?.tagCloud?.slice(Math.ceil(question?.tagCloud.length / 2))} translations={translations} />
          </View>
        )
      }
    </View>
  )
}

export default Question;
