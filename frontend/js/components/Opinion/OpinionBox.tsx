import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import { ListGroupItem } from 'react-bootstrap'
import OpinionPreview from './OpinionPreview'
import OpinionAnswer from './OpinionAnswer'
import OpinionButtons from './OpinionButtons'
import OpinionAppendices from './OpinionAppendices'
import OpinionBody from './OpinionBody'
import OpinionVotesBox from './Votes/OpinionVotesBox'
import type { OpinionBox_opinion } from '~relay/OpinionBox_opinion.graphql'
import TrashedMessage from '../Trashed/TrashedMessage'
import ListGroup from '../Ui/List/ListGroup'
import { translateContent } from '~/utils/ContentTranslator'
import { OpinionContainer } from '../Consultation/Opinion'
import { dispatchNavBarEvent } from '@shared/navbar/NavBar.utils'
type Props = {
  readonly opinion: OpinionBox_opinion & {
    __typename: 'Version' | 'Opinion'
  }
  rankingThreshold: number
  opinionTerm: number
}
export const OpinionBox = ({ opinionTerm, opinion, rankingThreshold }: Props) => {
  const intl = useIntl()

  const { section, step } = opinion

  React.useEffect(() => {
    dispatchNavBarEvent('set-breadcrumb', [
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: step?.project?.title, href: step?.project?.url || '' },
      { title: step?.label, href: step?.url },
      { title: opinion?.title, href: '' },
    ])
  }, [step, intl, opinion])

  const getBoxLabel = () =>
    opinion.__typename === 'Version' ? 'global.version' : opinionTerm === 0 ? 'global.proposal' : 'global.article'

  if (!section) return null
  const { color } = section
  const parentTitle = opinion.__typename === 'Version' ? opinion.parent?.title : section.title
  const backLink = opinion.__typename === 'Version' ? opinion.parent?.url : section.url
  const colorClass = `opinion opinion--${color} opinion--current`

  return (
    <TrashedMessage className="mb-15" contribution={opinion}>
      <div id="OpinionBox" className="block block--bordered opinion__details">
        <div className={colorClass}>
          <div
            className="opinion__header opinion__header--centered"
            style={{
              height: 'auto',
            }}
          >
            <a className="pull-left btn btn-default opinion__header__back" href={backLink}>
              <i className="cap cap-arrow-1-1" />
              <span className="hidden-xs hidden-sm">
                {' '}
                <FormattedMessage id="opinion.header.back" />
              </span>
            </a>
            <div className="opinion__header__title" />
            <h2 className="h4 opinion__header__title">
              <FormattedMessage id={getBoxLabel()} />
              <p
                className="small excerpt"
                style={{
                  marginTop: '5px',
                }}
              >
                {translateContent(parentTitle)}
              </p>
            </h2>
          </div>
          <ListGroup className="mb-0">
            <ListGroupItem className="list-group-item__opinion no-border">
              <OpinionContainer>
                <OpinionPreview rankingThreshold={rankingThreshold} opinion={opinion} showUpdatedDate />
              </OpinionContainer>
            </ListGroupItem>
          </ListGroup>
        </div>
        <OpinionAppendices opinion={opinion} />
        <div className="opinion__description">
          <OpinionBody opinion={opinion} />
          <OpinionVotesBox opinion={opinion} />
          <div
            className="opinion__buttons"
            style={{
              marginTop: '15px',
              marginBottom: 0,
            }}
            aria-label={<FormattedMessage id="vote.form" />}
          >
            <OpinionButtons opinion={opinion} />
          </div>
        </div>
        <OpinionAnswer opinion={opinion} />
      </div>
    </TrashedMessage>
  )
}
export default createFragmentContainer(OpinionBox, {
  opinion: graphql`
    fragment OpinionBox_opinion on OpinionOrVersion @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...OpinionPreview_opinion
      ...OpinionAnswer_opinion
      ...OpinionVotesBox_opinion @arguments(isAuthenticated: $isAuthenticated)
      ...OpinionButtons_opinion @arguments(isAuthenticated: $isAuthenticated)
      ...OpinionBody_opinion
      ...OpinionAppendices_opinion
      ...TrashedMessage_contribution

      ... on Opinion {
        __typename
        title
        section {
          title
          color
          url
        }
        step {
          label
          url
          project {
            title
            url
          }
        }
      }
      ... on Version {
        __typename
        title
        section {
          title
          color
          url
        }
        parent {
          title
          url
        }
        step {
          label
          url
          project {
            title
            url
          }
        }
      }
    }
  `,
})
