import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import Tag from '~/components/Ui/Labels/Tag'
import type { ProposalDetailLikersLabel_proposal } from '~relay/ProposalDetailLikersLabel_proposal.graphql'
import { MetadataPlaceHolder } from '~/components/Proposal/Page/Aside/ProposalPageMetadata.placeholder'
import AppBox from '~ui/Primitives/AppBox'

type Props = {
  proposal: ProposalDetailLikersLabel_proposal
  componentClass: string
  title: string
  onClick: (...args: Array<any>) => any
  size?: string
  newDesign?: boolean
}
export class ProposalDetailLikersLabel extends React.Component<Props> {
  static defaultProps = {
    componentClass: 'a',
  }

  render() {
    const { size, proposal, componentClass, title, onClick, newDesign } = this.props

    if (newDesign && (!proposal || proposal?.likers.length > 0)) {
      return (
        <AppBox ml="25px">
          <MetadataPlaceHolder ready={!!proposal}>
            <span
              style={{
                fontSize: 16,
              }}
              onClick={onClick}
              onKeyDown={onClick}
              role="button"
              tabIndex="0"
            >
              <FormattedMessage
                id="proposal.likers.count"
                values={{
                  num: proposal?.likers.length,
                }}
              />
            </span>
          </MetadataPlaceHolder>
        </AppBox>
      )
    }

    if (proposal?.likers.length > 0) {
      return (
        <Tag size={size} as={componentClass} title={title} onClick={onClick} icon="cap cap-heart-1 icon--red">
          <FormattedMessage
            id="proposal.likers.count"
            values={{
              num: proposal?.likers.length,
            }}
          />
        </Tag>
      )
    }

    return null
  }
}
export default createFragmentContainer(ProposalDetailLikersLabel, {
  proposal: graphql`
    fragment ProposalDetailLikersLabel_proposal on Proposal {
      id
      likers {
        id
      }
    }
  `,
})
