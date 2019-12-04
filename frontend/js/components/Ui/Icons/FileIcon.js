// @flow
import * as React from 'react';
import { Label as BtstLabel } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  format: ?string,
};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'file-icon',
})`
  position: relative;
  display: inline-block;
`;

const Label: StyledComponent<{}, {}, BtstLabel> = styled(BtstLabel)`
  position: absolute;
  top: 24px;
  left: 22px;
  text-transform: uppercase;
`;

const FileIcon = (props: Props) => {
  const { format } = props;

  return (
    <Container>
      <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 24 24">
        <title>file</title>
        <path
          stroke="none"
          fill={colors.primaryColor}
          d="M15.318,2.146l4.536,4.536A.5.5,0,0,1,20,7.035V21.5a.5.5,0,0,1-.5.5H4.5a.5.5,0,0,1-.5-.5V2.5A.5.5,0,0,1,4.5,2H14.965A.5.5,0,0,1,15.318,2.146ZM15.586,0H4A2,2,0,0,0,2,2V22a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V6.414a1,1,0,0,0-.293-.707L16.293.293A1,1,0,0,0,15.586,0Z"
        />
      </svg>
      {format && <Label>{format}</Label>}
    </Container>
  );
};

export default FileIcon;
