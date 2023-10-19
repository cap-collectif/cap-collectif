import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { PrimarySSOButton, SecondarySSOButton, TertiarySSOButton } from '~/components/User/Invitation/SSOButton.style'
type DestinationType = {
  readonly pathname: string
  readonly search: string
}
type Props = {
  readonly index: number
  readonly primaryColor: string
  readonly btnTextColor: string
  readonly to: DestinationType
  readonly children: JSX.Element | JSX.Element[] | string
}

const CreateAccountEmailLink = ({ index, primaryColor, btnTextColor, to, children }: Props) => {
  if (index === 0) {
    return (
      <PrimarySSOButton backgroundColor={primaryColor} textColor={btnTextColor} to={to} as={RouterLink}>
        {children}
      </PrimarySSOButton>
    )
  }

  if (index === 1) {
    return (
      <SecondarySSOButton borderColor={primaryColor} textColor={primaryColor} to={to} as={RouterLink}>
        {children}
      </SecondarySSOButton>
    )
  }

  return (
    <TertiarySSOButton textColor={primaryColor} to={to} as={RouterLink}>
      {children}
    </TertiarySSOButton>
  )
}

export default CreateAccountEmailLink
