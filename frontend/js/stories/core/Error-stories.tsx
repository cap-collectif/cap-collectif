// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import ErrorIncident from '~ui/ErrorIncident/ErrorIncident'

storiesOf('Core/Error', module).add('ErrorIncident', () => {
  return (
    <ErrorIncident>
      <p>Ca charge pas</p>
      <p>Try to reload</p>
    </ErrorIncident>
  )
})
