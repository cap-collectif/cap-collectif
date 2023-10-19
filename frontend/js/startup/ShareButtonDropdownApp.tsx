// @ts-nocheck
import React from 'react'
import Providers from './Providers'
import ShareButtonDropdownLegacy from '../components/Utils/ShareButtonDropdownLegacy'
import ShareButtonDropdown from '~/components/Utils/ShareButtonDropdown'

type Props = {
  id: string
  title: string
  url: string
  useDS?: boolean
}
export default (props: Props) => {
  if (props.useDS) {
    document.getElementsByTagName('html')[0].style.fontSize = '14px'
    return (
      <Providers designSystem resetCSS={false}>
        <ShareButtonDropdown {...props} />
      </Providers>
    )
  }

  return (
    <Providers>
      <ShareButtonDropdownLegacy {...props} />
    </Providers>
  )
}
