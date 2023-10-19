// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import News from '~/components/Ui/News/NewsCard'
import { post } from '../mocks/news'
import { $fragmentRefs } from '../mocks/relay'

const postWithFragment = { ...post, $fragmentRefs }
storiesOf('Cap Collectif/ News', module)
  .add('with body content', () => <News post={postWithFragment} withContent />)
  .add('without body content', () => <News post={postWithFragment} />)
