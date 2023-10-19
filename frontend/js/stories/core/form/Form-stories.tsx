// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import Question from '~/components/Ui/Form/Question/Question'
import Description from '~/components/Ui/Form/Description/Description'
import Help from '~/components/Ui/Form/Help/Help'
import { TYPE_FORM } from '~/constants/FormConstants'

storiesOf('Core/Form/Question', module).add('Default', () => {
  return <Question>1. Comment appelle-t-on un Hamster dans l&lsquo;espace ?</Question>
})
storiesOf('Core/Form/Description', module).add('Default', () => {
  return <Description typeForm={TYPE_FORM.QUESTIONNAIRE}>Un hamstéroïde hahaha (voir composant question)</Description>
})
storiesOf('Core/Form/Help', module).add('Default', () => {
  return (
    <Help typeForm={TYPE_FORM.QUESTIONNAIRE}>
      “There are only two hard things in Computer Science: cache invalidation and naming things” de Phil Karlton
    </Help>
  )
})
