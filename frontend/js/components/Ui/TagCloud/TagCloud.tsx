import React, { useState } from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import Tooltip from '~ds/Tooltip/Tooltip'

type Tag = {
  value: string
  count: number
  onClick: () => void
}
const MAX_LENGTH = 25
type Props = {
  tags: Array<{
    tag: Tag
    marginBottom: number
  }>
  maxSize: number
  minSize: number
}
const Container = styled.div<{
  isHover: boolean
}>`
  text-align: center;
  font-family: OpenSans, helvetica, arial, sans-serif;
  font-weight: 600;
  padding: 25px;
  ${({ isHover }) =>
    isHover &&
    css`
      button:not(:hover) {
        opacity: 0.5;
      }
    `}
`

const getColor = (size: number) => {
  if (size > 40) return '#1A88FF'
  if (size > 24) return '#006CE0'
  if (size > 16) return '#0051A8'
  return '#003670'
}

const fontSizeConverter = (count, min, max, minSize, maxSize) => {
  if (max - min === 0) {
    return Math.round((minSize + maxSize) / 2)
  }

  return Math.round(((count - min) * (maxSize - minSize)) / (max - min) + minSize)
}

const styles = {
  margin: '5px',
  verticalAlign: 'middle',
  display: 'inline-block',
  background: 'none',
  border: 'none',
  padding: 0,
}

const renderer = (tag: Tag, size: number, intl: IntlShape, setIsHover, marginBottom) => {
  const fontSize = `${size}px`
  const color = getColor(size)
  const style = { ...styles, color, fontSize }
  return (
    <Tooltip
      key={`info-occurences-${tag.value}`}
      label={intl.formatMessage(
        {
          id: 'appearances-count',
        },
        {
          num: tag.count,
        },
      )}
      id={`info-occurences-tooltip-${tag.value}`}
      className="text-left"
      placement="top"
      style={{
        marginBottom,
      }}
    >
      <button
        type="button"
        style={{ ...style, marginBottom }}
        key={tag.value}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={tag.onClick}
      >
        {tag.value.length <= MAX_LENGTH ? tag.value : `${tag.value.substr(0, MAX_LENGTH)}...`}
      </button>
    </Tooltip>
  )
}

const renderTags = (props, data, intl, setIsHover) => {
  const { minSize, maxSize } = props
  const counts = data.map(({ tag }: { tag: Tag }) => tag.count)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  return data.map(({ tag, marginBottom }: { tag: Tag; marginBottom: number }) => {
    const fontSize = fontSizeConverter(tag.count, min, max, minSize, maxSize)
    return renderer(tag, fontSize, intl, setIsHover, marginBottom)
  })
}

export const TagCloud = React.forwardRef<HTMLElement, Props>((props: Props, ref) => {
  const { tags } = props
  const intl = useIntl()
  const [isHover, setIsHover] = useState(false)
  return (
    // @ts-ignore
    <Container isHover={isHover} ref={ref}>
      {renderTags(props, tags, intl, setIsHover)}
    </Container>
  )
})
export default TagCloud
