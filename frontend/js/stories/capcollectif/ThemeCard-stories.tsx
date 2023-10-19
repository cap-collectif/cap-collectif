// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import ThemeCard from '../../components/Ui/ThemeCard/ThemeCard'
import { theme, metricsWithoutEvent } from '../mocks/theme'

storiesOf('Cap Collectif/ ThemeCard', module)
  .add('default case', () => <ThemeCard theme={theme} />)
  .add('without event metrics', () => <ThemeCard theme={metricsWithoutEvent} />)
