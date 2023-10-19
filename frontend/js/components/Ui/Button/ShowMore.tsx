import React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

const ShowMoreButton: StyledComponent<any, {}, HTMLButtonElement> = styled.button`
  align-items: center;
  width: 100%;
  background-color: white;
  border-radius: 3px;
`

const ShowMore = ({ onClick }: { onClick: () => void }) => (
  <ShowMoreButton onClick={onClick}>
    <i className="cap-add-1" /> <FormattedMessage id="global.more" />
  </ShowMoreButton>
)

export default ShowMore
