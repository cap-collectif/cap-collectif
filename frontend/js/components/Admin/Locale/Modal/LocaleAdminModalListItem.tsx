import React from 'react'
import { FormattedMessage } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import { Field } from 'redux-form'
import renderInput from '~/components/Form/Field'
import type { LocaleAdminModalListItem_locale } from '~relay/LocaleAdminModalListItem_locale.graphql'

type Props = {
  locale: LocaleAdminModalListItem_locale
}
export const LocaleAdminModalListItem = ({ locale }: Props) => {
  const { id, isDefault, traductionKey } = locale
  return (
    <Field
      type="checkbox"
      disabled={isDefault}
      name={`${id}.isEnabled`}
      divClassName="pl-20"
      id={`locale-${id}-enabled`}
      component={renderInput}
    >
      <span className="font-weight-bold">
        <FormattedMessage id={traductionKey} />
      </span>
    </Field>
  )
}
export default createFragmentContainer(LocaleAdminModalListItem, {
  locale: graphql`
    fragment LocaleAdminModalListItem_locale on Locale {
      id
      traductionKey
      isEnabled
      isDefault
    }
  `,
})
