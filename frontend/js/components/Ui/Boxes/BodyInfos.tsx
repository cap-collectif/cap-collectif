import React from 'react'
import styled from 'styled-components'
import BodyText, { DEFAULT_MAX_LINES, LINE_HEIGHT } from './BodyText'
import { Card } from '../Card/Card'
import Image from '~ui/Primitives/Image'
type Media = {
  readonly name: string
  readonly url: string
}
type Props = {
  readonly body: string
  readonly illustration?: Media | null | undefined
  readonly maxLines?: number
}
const CardBodyInfos = styled(Card.Body).attrs({
  className: 'body__infos--body',
})`
  display: block;

  & img.body__infos--illustration {
    max-height: ${props => LINE_HEIGHT * props.maxLines}px;
    margin: 0 15px 15px 0;
    float: left;
  }

  & .body__infos__content {
    display: inline;
  }
`
export class BodyInfos extends React.Component<Props> {
  render() {
    const { body, maxLines, illustration } = this.props
    return body ? (
      <Card>
        <CardBodyInfos maxLines={maxLines || DEFAULT_MAX_LINES}>
          {illustration && (
            <Image className="body__infos--illustration" src={illustration.url} alt={illustration.name || ''} />
          )}
          {maxLines ? <BodyText maxLines={maxLines} text={body} /> : <BodyText text={body} />}
        </CardBodyInfos>
      </Card>
    ) : null
  }
}
export default BodyInfos
