// @ts-nocheck
import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { useIntl } from 'react-intl'
import Card from '../Ui/Card/Card'
import OpinionTypeLabel from './OpinionTypeLabel'
import type { OpinionPreviewTitle_opinion } from '~relay/OpinionPreviewTitle_opinion.graphql'
import { translateContent } from '@shared/utils/contentTranslator'

type Props = {
  opinion: OpinionPreviewTitle_opinion
  showTypeLabel: boolean
}
export const OpinionPreviewTitle = ({ opinion, showTypeLabel }: Props) => {
  const intl = useIntl()
  return (
    <Card.Title tagName="div" firstElement={false}>
      {opinion.trashed && (
        <span className="label label-default mr-5">
          {intl.formatMessage({
            id: 'global.is_trashed',
          })}
        </span>
      )}
      {showTypeLabel ? <OpinionTypeLabel section={opinion.section || null} /> : null}
      {showTypeLabel ? ' ' : null}
      <a
        href={opinion.url}
        aria-label={intl.formatMessage({
          id: 'admin.fields.selection.proposal',
        })}
        title={translateContent(opinion.title)}
      >
        {translateContent(opinion.title)}
      </a>
    </Card.Title>
  )
}
export default createFragmentContainer(OpinionPreviewTitle, {
  opinion: graphql`
    fragment OpinionPreviewTitle_opinion on OpinionOrVersion {
      ... on Opinion {
        url
        title
        trashed
        section {
          ...OpinionTypeLabel_section
        }
      }
      ... on Version {
        url
        title
        section {
          ...OpinionTypeLabel_section
        }
      }
    }
  `,
})
