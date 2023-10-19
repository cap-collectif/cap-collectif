// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import Image from '~ui/Primitives/Image'

const importAll = r => r.keys().map(r)

const images: Array<string> = importAll(require.context('../../../../__snapshots__/emails', false, /\.(png)$/))
export const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  img {
    width: 100%;
    border: 1px solid;
  }
  div {
    margin: 2px;
  }

  div:last-child {
    width: 500px;
  }
`
images.map((image, i) => {
  return (
    !(i % 2) &&
    storiesOf('Cap Collectif/Mails', module).add(
      image.substring(image.indexOf('a/') + 2, image.indexOf('.html')),
      () => (
        <Container>
          <div>
            <Image src={images[i + 1]} alt="web view" />
          </div>
          <div>
            <Image src={image} alt="mobile view" />
          </div>
        </Container>
      ),
    )
  )
})
