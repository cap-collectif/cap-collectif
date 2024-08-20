import React, { useState } from 'react'

import styled from 'styled-components'
import copy from 'copy-to-clipboard'
import { FormattedMessage } from 'react-intl'
import colors from '~/utils/colors'
import { MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import Tooltip from '~ds/Tooltip/Tooltip'
type Props = {
  readonly url: string
  readonly className?: string
}
const Container = styled.div`
  height: 24px;
  display: flex;

  > input {
    color: ${colors.darkGray};
    background: ${colors.formBgc};
    font-size: 11px;
    padding: 3px 8px;
    border-top-left-radius: ${MAIN_BORDER_RADIUS_SIZE};
    border-bottom-left-radius: ${MAIN_BORDER_RADIUS_SIZE};
    border: 1px solid ${colors.lightGray};
    width: calc(100% - 24px);
    text-overflow: ellipsis;
  }

  > button {
    width: 24px;
    background: ${colors.blue};
    border: 0;
    border-top-right-radius: ${MAIN_BORDER_RADIUS_SIZE};
    border-bottom-right-radius: ${MAIN_BORDER_RADIUS_SIZE};
    outline: none;
    padding-top: 2px;
  }
`
export const Link = ({ url, className }: Props) => {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  return (
    <Container className={className} onMouseLeave={() => setIsCopied(false)}>
      <input type="text" value={url} disabled />
      <Tooltip
        placement="top"
        label={<FormattedMessage id={isCopied ? 'copied-link' : 'copy-link'} />}
        className="text-left"
        id={`tooltip-url-${url}`}
        style={{
          transition: 'unset',
          wordBreak: 'break-word',
        }}
      >
        <button
          type="button"
          onClick={() => {
            copy(url)
            setIsCopied(true)
          }}
        >
          <Icon name={ICON_NAME.link} size={15} color={colors.white} />
        </button>
      </Tooltip>
    </Container>
  )
}
export default Link
