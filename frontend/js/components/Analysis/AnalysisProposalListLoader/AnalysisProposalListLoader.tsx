import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import Loader from '~ui/FeedbacksIndicators/Loader'
import AnalysisProposalListLoaderContainer from './AnalysisProposalListLoader.style'

const AnalysisProposalListLoader = () => (
  <AnalysisProposalListLoaderContainer>
    <Loader inline size={16} />
    <FormattedMessage id="synthesis.common.loading" />
  </AnalysisProposalListLoaderContainer>
)

export default AnalysisProposalListLoader
