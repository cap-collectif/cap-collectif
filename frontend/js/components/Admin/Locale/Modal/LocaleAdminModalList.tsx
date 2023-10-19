import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import LocaleAdminModalListItem from './LocaleAdminModalListItem'
import type { LocaleAdminModalList_locales } from '~relay/LocaleAdminModalList_locales.graphql'

type Props = {
  locales: LocaleAdminModalList_locales
}
export const LocaleAdminModalList = ({ locales }: Props) => {
  return (
    <>
      {locales.map(locale => (
        <LocaleAdminModalListItem key={locale.id} locale={locale} />
      ))}
    </>
  )
}
export default createFragmentContainer(LocaleAdminModalList, {
  locales: graphql`
    fragment LocaleAdminModalList_locales on Locale @relay(plural: true) {
      id
      ...LocaleAdminModalListItem_locale
    }
  `,
})
