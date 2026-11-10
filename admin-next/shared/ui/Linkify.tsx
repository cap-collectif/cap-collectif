import * as React from 'react'
import linkify from '@shared/utils/linkify'
import { externalLinkProps } from '@shared/ui/ExternalLinkIcon'

type Props = {
  readonly children?: React.ReactNode
  // Class of the wrapping span, "Linkify" by default as with the former react-linkify library
  readonly className?: string
  readonly linkClassName?: string
}

// Turns the URLs found in the text children (at any depth) into links opening in a new tab.
// Content passed through props (e.g. an HTML string given to a renderer) is not inspected.
const linkifyNode = (node: React.ReactNode, linkClassName?: string): React.ReactNode => {
  if (typeof node === 'string') {
    const tokens = linkify(node)

    if (!tokens.some(token => token.type === 'link')) return node

    return tokens.map((token, index) =>
      token.type === 'link' ? (
        <a key={index} href={token.href} className={linkClassName} {...externalLinkProps}>
          {token.value}
        </a>
      ) : (
        token.value
      ),
    )
  }

  // Existing links and buttons are kept as they are, as react-linkify did, since an anchor cannot be nested in them
  if (
    React.isValidElement<{ children?: React.ReactNode }>(node) &&
    node.type !== 'a' &&
    node.type !== 'button' &&
    node.props.children
  ) {
    return React.cloneElement(node, undefined, linkifyChildren(node.props.children, linkClassName))
  }

  return node
}

const linkifyChildren = (children: React.ReactNode, linkClassName?: string): React.ReactNode =>
  React.Children.map(children, child => linkifyNode(child, linkClassName))

const Linkify: React.FC<Props> = ({ children, className = 'Linkify', linkClassName }) => (
  <span className={className}>{linkifyChildren(children, linkClassName)}</span>
)

export default Linkify
