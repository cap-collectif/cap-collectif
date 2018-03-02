// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
// import { injectGlobal } from 'styled-components';
import Card from './Card';
import CardCustom from './CardCustom';
import { Font } from './Font';

const Row = styled.div.attrs({
  className: 'row'
})`
  display: flex;
  flex-wrap: wrap;
`;

const Col = styled.div.attrs({
  className: 'col-lg-3 col-md-4 col-sm-6 col-xs-12'
})`
  display: flex;
`;

const Title = styled.h2`
  
`;

storiesOf('Style', module)
  .add('Fonts', () => {
    return (
      <div className="container">
        <Font />
      </div>
    );
  })

