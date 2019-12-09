// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import colors from '../../../utils/colors';

type Props = {|
  lines?: number,
|};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'visible-print-block',
})`
  width: 100%;
  margin-bottom: 15pt;

  span {
    width: 100%;
    border-bottom: 1px solid ${colors.iconGrayColor};
    height: 31px;
    display: block;

    &:first-child {
      height: 21px;
    }
  }
`;

const Notepad = (props: Props) => {
  const { lines } = props;

  const rows = [];

  const getRows = () => {
    // $FlowFixMe
    for (let i = 0; i < lines; i++) {
      rows.push(<span key={i} />);
    }

    return rows;
  };

  return <Container>{getRows()}</Container>;
};

Notepad.defaultProps = {
  lines: 15,
};

export default Notepad;
