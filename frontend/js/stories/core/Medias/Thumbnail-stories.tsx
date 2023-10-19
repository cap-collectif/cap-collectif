// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import Thumbnail from '~ui/Medias/Thumbnail/Thumbnail'

storiesOf('Core/Medias/Thumbnail', module)
  .add('default', () => {
    return <Thumbnail width="500px" height="500px" image="https://via.placeholder.com/1000x1000" />
  })
  .add('with content', () => {
    return (
      <Thumbnail width="500px" height="500px">
        <p
          style={{
            color: '#fff',
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid aperiam eveniet labore magni voluptas.
          Debitis est maiores similique totam unde.
        </p>
      </Thumbnail>
    )
  })
  .add('with image and content', () => {
    return (
      <Thumbnail width="500px" height="500px" image="https://via.placeholder.com/1000x1000">
        <p
          style={{
            color: '#fff',
            backgroundColor: 'grey',
            padding: 12,
            borderRadius: 4,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid aperiam eveniet labore magni voluptas.
          Debitis est maiores similique totam unde.
        </p>
      </Thumbnail>
    )
  })
  .add('with image and content 2', () => {
    return (
      <Thumbnail width="500px" height="500px" image="https://via.placeholder.com/1000x1000?Text=">
        <p
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            color: '#fff',
            maxWidth: 300,
            backgroundColor: 'grey',
            padding: 12,
            borderRadius: 4,
            margin: 0,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid aperiam eveniet labore.
        </p>
        <p
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#fff',
            maxWidth: 300,
            backgroundColor: 'grey',
            padding: 12,
            borderRadius: 4,
            margin: 0,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid aperiam eveniet labore.
        </p>
      </Thumbnail>
    )
  })
