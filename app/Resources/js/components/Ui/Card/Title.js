// @flow
import React from 'react';
import styled from 'styled-components';

type Props = {
  tagName?: string,
};

const Container = styled.tagName`
  font-size: 18px;
  line-height: 1.2;
  margin: 0 0 10px;
`;

export class Title extends React.PureComponent<Props> {
  static defaultProps = {
    tagName: 'h3'
  };

  render() {
    const { tagName } = this.props;

    if(tagName) {
      return React.createElement(tagName, null, null);
    }

    return avatar;
  }
}

export default Title;
