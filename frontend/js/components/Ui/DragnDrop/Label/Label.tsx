import * as React from 'react'
import LabelContainer from './Label.style'

type LabelProps = {
  children: JSX.Element | JSX.Element[] | string
}

const Label = ({ children }: LabelProps) => (
  <LabelContainer>
    {typeof children === 'string' ? (
      <span
        dangerouslySetInnerHTML={{
          __html: children,
        }}
      />
    ) : (
      children
    )}
  </LabelContainer>
)

export default Label
