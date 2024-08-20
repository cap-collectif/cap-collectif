import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import Linkify from 'react-linkify'
import { FormattedMessage } from 'react-intl'
import nl2br from 'react-nl2br'
import type { CommentBody_comment } from '~relay/CommentBody_comment.graphql'
import { isPredefinedTraductionKey, translateContent } from '@shared/utils/contentTranslator'
type Props = {
  readonly comment: CommentBody_comment
}
type State = {
  readonly expanded: boolean
}
export class CommentBody extends React.Component<Props, State> {
  state = {
    expanded: false,
  }
  textShouldBeTruncated = () => {
    const { comment } = this.props
    return comment.body && comment.body.length > 400
  }
  generateText = () => {
    const { comment } = this.props
    const { expanded } = this.state
    let text = ''

    if (isPredefinedTraductionKey(comment.body)) {
      text = translateContent(comment.body)
    } else if (!this.textShouldBeTruncated() || expanded) {
      text = comment.body
    } else if (comment.body) {
      text = comment.body.substr(0, 400)
      text = text.substr(0, Math.min(text.length, text.lastIndexOf(' ')))

      if (text.indexOf('.', text.length - 1) === -1) {
        text += '...'
      }

      text += ' '
    }

    return text
  }
  expand = (expanded: boolean) => {
    this.setState({
      expanded,
    })
  }
  renderReadMoreOrLess = () => {
    const { expanded } = this.state

    if (this.textShouldBeTruncated() && !expanded) {
      return (
        <button type="button" className="btn-link" onClick={this.expand.bind(this, true)}>
          <FormattedMessage id="global.read_more" />
        </button>
      )
    }
  }
  renderTrashedLabel = () => {
    const { comment } = this.props

    if (comment.trashed) {
      return (
        <span className="label label-default mr-5">
          <FormattedMessage id="global.is_trashed" />
        </span>
      )
    }

    return null
  }
  renderTrashedReason = () => {
    const { comment } = this.props

    if (comment.trashed) {
      return (
        <div className="mt-5">
          <span>{comment.trashedReason}</span>
        </div>
      )
    }

    return null
  }

  render() {
    return (
      <div
        className="opinion__text"
        style={{
          wordBreak: 'break-word',
        }}
      >
        {this.renderTrashedLabel()}
        <Linkify
          properties={{
            className: 'external-link',
          }}
        >
          {nl2br(this.generateText())}
        </Linkify>
        {this.renderReadMoreOrLess()}
        {this.renderTrashedReason()}
      </div>
    )
  }
}
export default createFragmentContainer(CommentBody, {
  comment: graphql`
    fragment CommentBody_comment on Comment {
      trashed
      trashedReason
      body
    }
  `,
})
