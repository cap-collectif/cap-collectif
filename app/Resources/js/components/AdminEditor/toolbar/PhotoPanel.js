// @flow
import React from 'react';
import styled from 'styled-components';

import * as Icons from '../components/Icons';
import FormatButton from './FormatButton';

const Wrapper = styled.div`
  width: 200px;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
`;

const Button = styled(FormatButton)`
  font-size: 12px;
  font-weight: 600;
  justify-content: flex-start;

  svg {
    margin-right: 5px;
  }

  &:hover:not(:disabled) {
    color: hsl(201, 82%, 55%);
  }
`;

type Props = {
  onInsertImage: Function,
};

function PhotoPanel({ onInsertImage }: Props) {
  return (
    <Wrapper>
      <Button onClick={onInsertImage}>
        <Icons.InsertLink />
        <span>À partir d&apos;une URL</span>
      </Button>
      <Button disabled>
        <Icons.CloudUpload /> Depuis mon ordinateur
      </Button>
    </Wrapper>
  );
}

export default PhotoPanel;
