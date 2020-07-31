// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled, { type StyledComponent } from 'styled-components';

const importAll = r => r.keys().map(r);

const images: Array<string> = importAll(
  // $FlowFixMe require.context is webpack specific
  require.context('../../../../__snapshots__/emails', false, /\.(png)$/),
);

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
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
`;

images.map((image, i) => {
  return (
    !(i % 2) &&
    storiesOf('Cap Collectif|Mails', module).add(
      image.substring(image.indexOf('a/') + 2, image.indexOf('.html')),
      () => (
        <Container>
          <div>
            <img src={images[i + 1]} alt="web view" />
          </div>
          <div>
            <img src={image} alt="mobile view" />
          </div>
        </Container>
      ),
    )
  );
});
