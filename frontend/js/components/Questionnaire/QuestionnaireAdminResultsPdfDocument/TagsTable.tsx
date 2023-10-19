import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import colors from '~/styles/modules/colors'
import type { Translations } from '~/components/Questionnaire/QuestionnaireAdminResultsExportMenu'
const styles = StyleSheet.create({
  tr: {
    display: 'flex',
    flexDirection: 'row',
    padding: 15,
  },
  td: {
    width: 140,
  },
  tag_title: {
    fontFamily: 'OpenSans',
    color: colors.gray['700'],
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  tag_text: {
    fontFamily: 'OpenSans',
    color: colors.gray['700'],
    fontSize: 10,
    fontWeight: 400,
  },
})
type Tags =
  | ReadonlyArray<{
      readonly value: string
      readonly occurrencesCount: number
    }>
  | null
  | undefined
type Props = {
  tags: Tags
  translations: Translations | null | undefined
}

const TagsTable = ({ tags, translations }: Props) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
        marginTop: 30,
      }}
    >
      <View style={{ ...styles.tr, backgroundColor: colors.gray['100'] }}>
        <View style={styles.td}>
          <Text style={styles.tag_title}>{translations?.keyword.toUpperCase()}</Text>
        </View>
        <View style={styles.td}>
          <Text style={styles.tag_title}>{translations?.occurence.toUpperCase()}</Text>
        </View>
      </View>
      {tags?.map(({ value, occurrencesCount }, index) => {
        return (
          <View key={index} style={{ ...styles.tr, backgroundColor: index % 2 === 0 ? 'white' : colors.gray['100'] }}>
            <View style={styles.td}>
              <Text style={styles.tag_text}>{value}</Text>
            </View>
            <View style={styles.td}>
              <Text style={styles.tag_text}>{occurrencesCount}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default TagsTable
