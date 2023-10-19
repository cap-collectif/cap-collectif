// @ts-nocheck
import React from 'react'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import FormatButton from './FormatButton'

type Props = {
  editorState: Record<string, any>
  onTitleClick: (...args: Array<any>) => any
  isBlockActive: (...args: Array<any>) => any
  intl: IntlShape
}

function TitlesPanel({ editorState, onTitleClick, isBlockActive, intl }: Props) {
  return (
    <>
      <FormatButton
        onClick={() => onTitleClick('one')}
        active={isBlockActive(editorState, 'header-one')}
        tabIndex="-1"
        title={intl.formatMessage({
          id: 'editor.format.title1',
        })}
      >
        H1
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('two')}
        active={isBlockActive(editorState, 'header-two')}
        tabIndex="-1"
        title={intl.formatMessage({
          id: 'editor.format.title2',
        })}
      >
        H2
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('three')}
        active={isBlockActive(editorState, 'header-three')}
        tabIndex="-1"
        title={intl.formatMessage({
          id: 'editor.format.title3',
        })}
      >
        H3
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('four')}
        active={isBlockActive(editorState, 'header-four')}
        tabIndex="-1"
        title={intl.formatMessage({
          id: 'editor.format.title4',
        })}
      >
        H4
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('five')}
        active={isBlockActive(editorState, 'header-five')}
        tabIndex="-1"
        title={intl.formatMessage({
          id: 'editor.format.title5',
        })}
      >
        H5
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('six')}
        active={isBlockActive(editorState, 'header-six')}
        tabIndex="-1"
        title={intl.formatMessage({
          id: 'editor.format.title6',
        })}
      >
        H6
      </FormatButton>
    </>
  )
}

export default injectIntl(TitlesPanel)
