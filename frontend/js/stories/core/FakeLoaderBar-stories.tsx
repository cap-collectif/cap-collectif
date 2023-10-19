// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import FakeLoaderBar from '~ui/FakeLoaderBar/FakeLoaderBar'

storiesOf('Core/FakeLoaderBar', module).add('Default', () => {
  return <FakeLoaderBar isFinished={false} isLoading={false} />
})
storiesOf('Core/FakeLoaderBar', module).add('Fake fill', () => {
  return <FakeLoaderBar isFinished={false} isLoading />
})
storiesOf('Core/FakeLoaderBar', module).add('Fill', () => {
  return <FakeLoaderBar isFinished isLoading timeToEnd={3000} />
})
