import { Box, CapUIIcon, Flex } from '@cap-collectif/ui'
import { VoteStepMobileActions_proposalForm_query$key } from '@relay/VoteStepMobileActions_proposalForm_query.graphql'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import VoteStepMobileFilters from '../Filters/VoteStepMobileFilters'
import StepVoteMobileActionBtn from './VoteStepMobileActionBtn'

interface Props {
  form: VoteStepMobileActions_proposalForm_query$key
}

const FRAGMENT = graphql`
  fragment VoteStepMobileActions_proposalForm_query on ProposalForm {
    isMapViewEnabled
  }
`

const StepVoteMobileActions: React.FC<Props> = ({ form: formKey }) => {
  const intl = useIntl()
  const form = useFragment(FRAGMENT, formKey)

  const [isMapShown, setIsMapShown] = useQueryState('map_shown', parseAsInteger)
  const hasMapView = form?.isMapViewEnabled

  return (
    <Box position="sticky" zIndex={1} bottom={0} left={0} width="100%" backgroundColor="white" px="xs" py="sm">
      <Flex width="100%">
        <StepVoteMobileActionBtn icon={CapUIIcon.Search}>
          {intl.formatMessage({ id: 'global.search.label' })}
        </StepVoteMobileActionBtn>
        <StepVoteMobileActionBtn icon={CapUIIcon.Add}>
          {intl.formatMessage({ id: 'global.collect' })}
        </StepVoteMobileActionBtn>
        <StepVoteMobileActionBtn icon={CapUIIcon.ThumbUpO}>
          {intl.formatMessage({ id: 'global.vote' })}
        </StepVoteMobileActionBtn>
        {hasMapView && (
          <StepVoteMobileActionBtn
            icon={isMapShown ? CapUIIcon.PinO : CapUIIcon.Grid}
            onClick={() => setIsMapShown(isMapShown === 1 ? 0 : 1)}
          >
            {isMapShown
              ? intl.formatMessage({ id: 'step.vote.list_actions.thumbnails' })
              : intl.formatMessage({ id: 'global.card' })}
          </StepVoteMobileActionBtn>
        )}
      </Flex>
      <VoteStepMobileFilters />
    </Box>
  )
}

export default StepVoteMobileActions
