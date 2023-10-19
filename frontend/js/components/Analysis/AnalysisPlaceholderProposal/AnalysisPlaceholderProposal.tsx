import * as React from 'react'
import AnalysisPlaceholderProposalContainer from '~/components/Analysis/AnalysisProposal/AnalysisProposal.style'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import Skeleton from '~ds/Skeleton'
import Flex from '~ui/Primitives/Layout/Flex'
type Props = {
  readonly children: JSX.Element | JSX.Element[] | string
}

const AnalysisPlaceholderProposal = ({ children }: Props): JSX.Element => (
  <AnalysisPlaceholderProposalContainer asPlaceholder>
    <Flex direction="column" width="50%" maxWidth="50%">
      <Flex direction="column">
        <Skeleton.Text bg="blue.200" size="sm" mb={3} width="200px" />
        <Skeleton.Text size="sm" width="350px" />
      </Flex>

      <Flex direction="row" align="center" mt={2} spacing={2}>
        <Flex direction="row" align="center" width="30%">
          <Icon name={ICON_NAME.pin} size={12} />
          <Skeleton.Text size="sm" ml={2} width="100%" />
        </Flex>
        <Flex direction="row" align="center" width="30%">
          <Icon name={ICON_NAME.tag} size={12} />
          <Skeleton.Text size="sm" ml={2} width="100%" />
        </Flex>
      </Flex>
    </Flex>

    {children}
  </AnalysisPlaceholderProposalContainer>
)

export default AnalysisPlaceholderProposal
