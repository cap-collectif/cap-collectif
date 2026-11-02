// @ts-nocheck
import React from 'react'
import Providers from './Providers'
import { RelatedContentCard } from '~/components/Blog/RelatedContentCard'

export default props => (
  <Providers designSystem resetCSS={false}>
    <RelatedContentCard {...props} />
  </Providers>
)
