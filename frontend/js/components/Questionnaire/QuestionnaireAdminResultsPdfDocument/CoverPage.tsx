import React from 'react'
import { Image, Text, View, StyleSheet } from '@react-pdf/renderer'
import colors from '~/styles/modules/colors'
import type { Translations } from '~/components/Questionnaire/QuestionnaireAdminResultsExportMenu'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: 'white',
    justifyContent: 'start',
    padding: 35,
  },
  cover_title: {
    fontFamily: 'OpenSans',
    color: colors.gray['900'],
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 10,
  },
  cover_dates: {
    fontFamily: 'OpenSans',
    color: colors.gray['900'],
    fontSize: 14,
    fontWeight: 400,
    marginBottom: 8,
  },
  cover_participants: {
    fontFamily: 'OpenSans',
    color: colors.gray['700'],
    fontSize: 11,
    fontWeight: 400,
  },
  cover_footer: {
    fontFamily: 'OpenSans',
    color: colors.gray['700'],
    fontSize: 11,
    fontWeight: 400,
  },
  logo: {
    width: '140',
    height: '50',
    'object-fit': 'cover',
  },
})
type Props = {
  logoUrl: string
  url: string | null | undefined
  title: string
  translations: Translations | null | undefined
}

const CoverPage = ({ logoUrl, url, title, translations }: Props) => {
  if (!translations) return null
  return (
    <>
      <View
        style={{
          width: '100%',
          marginTop: 100,
          textAlign: 'center',
        }}
      >
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <Image style={styles.logo} src={logoUrl} />
        </View>
        <Text style={styles.cover_title}>{title}</Text>
        <Text style={styles.cover_dates}>{translations?.resultsCollectedBetweenDates}</Text>
        <Text style={styles.cover_participants}>
          {translations?.attendee}
          {translations?.particpationAllowed !== '' ? ` - ${translations?.particpationAllowed}` : ''}
        </Text>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          paddingVertical: 8,
          backgroundColor: '#F7F7F8',
          width: '100vw',
          textAlign: 'center',
        }}
      >
        <Text style={styles.cover_footer}>{url}</Text>
      </View>
    </>
  )
}

export default CoverPage
