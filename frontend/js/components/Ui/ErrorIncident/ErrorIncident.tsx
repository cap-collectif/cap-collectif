import * as React from 'react'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import ErrorIncidentContainer from './ErrorIncident.style'

type Props = {
  children: JSX.Element | JSX.Element[] | string
}

const ErrorIncident = ({ children }: Props) => (
  <ErrorIncidentContainer>
    <Icon name={ICON_NAME.warningRounded} size={30} className="icon-warning" />
    {children}
  </ErrorIncidentContainer>
)

export default ErrorIncident
