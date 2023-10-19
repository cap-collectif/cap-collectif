// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import Fixed from '~ui/Fixed/Fixed'

storiesOf('Core/Fixed', module).add('default', () => {
  return (
    <div
      style={{
        border: '1px solid red',
        height: 800,
      }}
    >
      <Fixed
        position={{
          top: '180px',
          left: '60%',
        }}
        width="300px"
      >
        Ceci est du contenu: Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium cupiditate eos harum
        neque tenetur voluptatum.
      </Fixed>
    </div>
  )
})
