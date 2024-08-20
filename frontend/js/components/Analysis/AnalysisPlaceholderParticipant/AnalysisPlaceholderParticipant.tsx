import * as React from 'react'
import colors from '~/utils/colors'
import { Container } from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipant/ProjectAdminParticipant.style'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import Skeleton from '~ds/Skeleton'
import Flex from '~ui/Primitives/Layout/Flex'

const TagContainer = ({ children }: { children: JSX.Element | JSX.Element[] | string }) => (
  <Flex direction="row" align="center" mr={3}>
    {children}
  </Flex>
)

const AnalysisPlaceholderParticipant = () => (
  <Container isSelectable={false}>
    <Flex direction="column">
      <Skeleton.Text width="150px" mb={2} size="md" />
      <Skeleton.Text width="250px" size="sm" />

      <Flex direction="row" align="center" mt={3}>
        <TagContainer>
          <Icon name={ICON_NAME.singleManFilled} size={12} color={colors.darkGray} />
          <Skeleton.Text width="50px" size="sm" ml={2} />
        </TagContainer>
        <TagContainer>
          <Icon name={ICON_NAME.paperPlane} size={12} color={colors.darkGray} />
          <Skeleton.Text width="150px" size="sm" ml={2} />
        </TagContainer>
        <TagContainer>
          <Icon name={ICON_NAME.like} size={12} color={colors.darkGray} />
          <Skeleton.Text width="50px" size="sm" ml={2} />
        </TagContainer>
        <TagContainer>
          <Icon name={ICON_NAME.messageBubbleFilled} size={12} color={colors.darkGray} />
          <Skeleton.Text width="50px" size="sm" ml={2} />
        </TagContainer>
      </Flex>
    </Flex>

    <Skeleton.Circle size="50px" />
  </Container>
)

export default AnalysisPlaceholderParticipant
