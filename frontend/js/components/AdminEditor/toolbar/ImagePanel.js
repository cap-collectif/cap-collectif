// @flow
import React, { useContext, type ComponentType } from 'react';
import styled from 'styled-components';
import { injectIntl, type IntlShape } from 'react-intl';

import { IMAGE } from '../renderer/constants';
import * as Icons from '../components/Icons';
import { insertAtomicBlock } from '../utils';
import { EditorContext } from '../context';
import FormatButton from './FormatButton';

const Wrapper: ComponentType<{}> = styled('div')`
  width: 200px;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
`;

type ButtonProps = {
  onClick: (event: SyntheticMouseEvent<HTMLButtonElement>) => void,
};

const Button: ComponentType<ButtonProps> = styled(FormatButton)`
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

type ImagePanelProps = {
  intl: IntlShape,
  onInsertImage: Function,
  uploadLocalImage?: (Function, Function) => void,
};

function ImagePanel({ intl, onInsertImage, uploadLocalImage }: ImagePanelProps) {
  // $FlowFixMe: context can be null but nevermind...
  const { editorState, handleChange } = useContext(EditorContext);

  function uploadImage(event: SyntheticMouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    function onSuccess(url: string) {
      const newState = insertAtomicBlock(editorState, IMAGE, { src: url });
      handleChange(newState);
    }

    function onError(err: string | Object) {
      // TODO: handle error better
      console.error(err); // eslint-disable-line no-console
    }

    // $FlowFixMe: function is not called if uploadLocalImage is undefined
    uploadLocalImage(onSuccess, onError);
  }

  return (
    <Wrapper>
      <Button onClick={onInsertImage}>
        <Icons.InsertLink />
        <span>{intl.formatMessage({ id: 'editor.image.upload.url' })}</span>
      </Button>
      {uploadLocalImage && (
        <Button onClick={uploadImage}>
          <Icons.CloudUpload />{' '}
          <span>{intl.formatMessage({ id: 'editor.image.upload.local' })}</span>
        </Button>
      )}
    </Wrapper>
  );
}

export default injectIntl(ImagePanel);
