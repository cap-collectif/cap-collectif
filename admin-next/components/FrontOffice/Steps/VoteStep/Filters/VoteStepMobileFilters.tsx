import { Box, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import VoteStepSearchBar from './VoteStepSearchBar'
import { useIntl } from 'react-intl'

const VoteStepMobileFilters: React.FC = () => {
  const intl = useIntl()

  return (
    <Modal
      size={CapUIModalSize.Fullscreen}
      height="100%"
      ariaLabel={intl.formatMessage({ id: 'vote.step.filter_project' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'vote.step.filter_project' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <VoteStepSearchBar />
        <Box mt="md">--- les filtres ici ---</Box>
      </Modal.Body>
    </Modal>
  )
}

export default VoteStepMobileFilters
