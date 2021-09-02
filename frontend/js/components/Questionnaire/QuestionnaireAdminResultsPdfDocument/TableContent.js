// @flow
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  convertToAlpha,
  convertToRoman,
} from '~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/utils';
import colors from '~/styles/modules/colors';
import type { Translations } from '~/components/Questionnaire/QuestionnaireAdminResultsExportMenu';
import type { QuestionsPdfType } from '~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/QuestionnaireAdminResultsPdfDocument';

const styles = StyleSheet.create({
  table_content_title: {
    color: colors.blue['800'],
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'OpenSans',
    marginBottom: 20,
  },
  table_content_section: {
    color: colors.blue['900'],
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'OpenSans',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  table_content_question_number: {
    color: colors.gray['800'],
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'OpenSans',
  },
  table_content_question_text: {
    color: colors.gray['800'],
    fontSize: 11,
    fontWeight: 400,
    fontFamily: 'OpenSans',
    paddingLeft: '12px',
    marginBottom: 10,
  },
  table_content_question_subsection: {
    color: colors.gray['800'],
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'OpenSans',
    marginBottom: 8,
  },
});

type Props = {
  questions: QuestionsPdfType,
  translations: ?Translations,
};

const TableContent = ({ questions, translations }: Props) => {
  return (
    <View>
      <Text style={styles.table_content_title}>{translations?.tableContent}</Text>
      {questions?.map((question, index) => {
        if (question?.category === 'section') {
          return (
            <Text key={index} style={styles.table_content_section}>
              {convertToRoman(question?.sectionIndex)} - {question?.title}
            </Text>
          );
        }
        if (question?.category === 'subsection') {
          return (
            <Text key={index} style={styles.table_content_question_subsection}>
              {convertToAlpha(question?.subSectionIndex)}. {question?.title}
            </Text>
          );
        }
        if (question?.category === 'question') {
          return (
            <Text key={index} style={styles.table_content_question_text}>
              <Text debug style={styles.table_content_question_number}>
                {question?.position}. &nbsp;
              </Text>
              {question?.title}
            </Text>
          );
        }
      })}
    </View>
  );
};

export default TableContent;
