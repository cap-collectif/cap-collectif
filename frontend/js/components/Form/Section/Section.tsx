import { $Values } from 'utility-types'
import * as React from 'react'
import { Container } from './Section.style'
import { TYPE_FORM } from '~/constants/FormConstants'
import SectionTitle from '~ui/Form/Section/SectionTitle'
import SubSectionTitle from '~ui/Form/SubSection/SubSectionTitle'
import SectionDescription from '~ui/Form/Section/SectionDescription'
import SubSectionDescription from '~ui/Form/SubSection/SubSectionDescription'

type Props = {
  children: JSX.Element | JSX.Element[] | string
  level: number | null | undefined
  description?: string | null | undefined
  typeForm?: $Values<typeof TYPE_FORM>
}

const Section = ({ children, level, description, typeForm }: Props) => (
  <Container className="form__section">
    {level === 0 ? (
      <SectionTitle typeForm={typeForm}>{children}</SectionTitle>
    ) : (
      <SubSectionTitle typeForm={typeForm}>{children}</SubSectionTitle>
    )}

    {description &&
      (level === 0 ? (
        <SectionDescription typeForm={typeForm}>{description}</SectionDescription>
      ) : (
        <SubSectionDescription typeForm={typeForm}>{description}</SubSectionDescription>
      ))}
  </Container>
)

export default Section
