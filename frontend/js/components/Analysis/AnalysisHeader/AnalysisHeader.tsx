import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import type { Match } from 'react-router-dom'
import { Link } from 'react-router-dom'
import AnalysisHeaderContainer from './AnalysisHeader.style'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'

type Props = {
  countProject: number
  match: Match
}

const AnalysisHeader = ({ countProject, match }: Props) => {
  const { params } = match
  const isProjectPage = !!params.projectSlug
  const hasManyProjects = countProject > 1
  return (
    <AnalysisHeaderContainer>
      {isProjectPage && hasManyProjects && (
        <Link to="/">
          <Icon name={ICON_NAME.chevronLeft} size={14} />
          <FormattedMessage id="my-projects" />
        </Link>
      )}
      <FormattedMessage tagName="h1" id="page.title.analysis.tool" />
    </AnalysisHeaderContainer>
  )
}

export default AnalysisHeader
