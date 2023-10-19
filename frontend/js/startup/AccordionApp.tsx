// @ts-nocheck
import * as React from 'react'
import Providers from './Providers'
import Accordion from '../components/Ui/Accordion/Accordion'

type Props = Record<string, any>
export default (props: Props) => (
  <Providers>
    <Accordion {...props} />
  </Providers>
)
