// @ts-nocheck
import type { ComponentType } from 'react'
import React, { useContext } from 'react'
import styled from 'styled-components'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import { IMAGE } from '../renderer/constants'
import * as Icons from '../components/Icons'
import { insertAtomicBlock } from '../utils'
import { EditorContext } from '../context'
import FormatButton from './FormatButton'
import { getImageInitialSize } from '../encoder/utils'

const Wrapper: ComponentType<{}> = styled('div')`
  width: 200px;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
`
type ButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}
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
`
type ImagePanelProps = {
  intl: IntlShape
  onInsertImage: (...args: Array<any>) => any
  uploadLocalImage?: (arg0: (...args: Array<any>) => any, arg1: (...args: Array<any>) => any) => void
}

function ImagePanel({ intl, onInsertImage, uploadLocalImage }: ImagePanelProps) {
  // @ts-expect-error: context can be null but nevermind...
  const { editorState, handleChange } = useContext(EditorContext)

  function uploadImage(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    async function onSuccess(url: string) {
      const img = await getImageInitialSize(url)
      const newState = insertAtomicBlock(editorState, IMAGE, {
        src: url,
        width: img.width,
        height: img.height,
        href: '',
        targetBlank: false,
      })
      handleChange(newState)
    }

    function onError(err: string | Record<string, any>) {
      // TODO: handle error better
      console.error(err) // eslint-disable-line no-console
    }

    // @ts-expect-error: function is not called if uploadLocalImage is undefined
    uploadLocalImage(onSuccess, onError)
  }

  return (
    <Wrapper>
      <Button onClick={onInsertImage}>
        <Icons.InsertLink />
        <span>
          {intl.formatMessage({
            id: 'editor.image.upload.url',
          })}
        </span>
      </Button>
      {uploadLocalImage && (
        <Button onClick={uploadImage}>
          <Icons.CloudUpload />{' '}
          <span>
            {intl.formatMessage({
              id: 'editor.image.upload.local',
            })}
          </span>
        </Button>
      )}
    </Wrapper>
  )
}

export default injectIntl(ImagePanel)
