import { Box, CapUIIcon, CapUIIconSize, Icon, Text } from '@cap-collectif/ui'
import { VoteStepHeroSection_proposalStep$key } from '@relay/VoteStepHeroSection_proposalStep.graphql'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import VoteStepProjectHero from './VoteStepProjectHero'

type Props = {
  step: VoteStepHeroSection_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepHeroSection_proposalStep on ProposalStep {
    ...VoteStepProjectHero_proposalStep
    project {
      visibility
      adminAlphaUrl
    }
  }
`

const VoteStepHeroSection: React.FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const intl = useIntl()
  const restrictedAccessAlert =
    step.project?.visibility === 'ME' || step.project?.visibility === 'ADMIN'
      ? intl.formatMessage({
          id: step.project.visibility === 'ME' ? 'global.draft.only_visible_by_you' : 'only-visible-by-administrators',
        })
      : null

  return (
    <>
      {restrictedAccessAlert ? (
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          top={0}
          width="100%"
          backgroundColor="#fcf8e3"
          color="#8a6d3b"
          border="1px solid #faebcc"
          px={3}
          py="10px"
          textAlign="center"
          mb={0}
          zIndex={1}
        >
          <Icon name={CapUIIcon.Lock} size={CapUIIconSize.Sm} mr={1} verticalAlign="text-bottom" />
          <Text as="span" color="inherit">
            {restrictedAccessAlert}
          </Text>
          {step.project?.adminAlphaUrl ? (
            <Box
              as="a"
              id="action_show"
              href={step.project.adminAlphaUrl}
              display="inline-flex"
              alignItems="center"
              marginLeft="15px"
              padding="5px 10px"
              backgroundColor="#f0ad4e"
              border="1px solid"
              borderColor="#eea236"
              borderRadius="4px"
              color="white"
              fontSize="12px"
              lineHeight="1.5"
              sx={{
                '&:hover': {
                  backgroundColor: '#ec971f',
                  borderColor: '#d58512',
                  color: 'white',
                  textDecoration: 'none',
                },
              }}
            >
              {intl.formatMessage({ id: 'action_edit' })}
              <Icon name={CapUIIcon.Preview} size={CapUIIconSize.Sm} ml={1} />
            </Box>
          ) : null}
        </Box>
      ) : null}
      <VoteStepProjectHero step={step} />
    </>
  )
}

export default VoteStepHeroSection
