import * as React from 'react'
import { FormattedHTMLMessage, IntlShape, useIntl } from 'react-intl'
import { Button, ButtonGroup, CapUIModalSize, Heading, Modal, toast, Text, Box } from '@cap-collectif/ui'
import ImportEventsForm from './ImportEventsForm'
import AddEventsMutation from 'mutations/AddEventsMutation'
import { AddEventsInput } from '@relay/AddEventsMutation.graphql'

export const getHeaders = (intl: IntlShape) => {
  return {
    title: intl.formatMessage({ id: 'global.title' }),
    body: intl.formatMessage({ id: 'global.description' }),
    authorEmail: intl.formatMessage({ id: 'project_download.label.author_email' }),
    startAt: intl.formatMessage({ id: 'event.import.start' }),
    endAt: intl.formatMessage({ id: 'end' }),
    guestListEnabled: intl.formatMessage({ id: 'global.registration' }),
    address: intl.formatMessage({ id: 'project_download.label.address' }),
    zipCode: intl.formatMessage({ id: 'admin.fields.event.zipcode' }),
    city: intl.formatMessage({ id: 'admin.fields.event.city' }),
    country: intl.formatMessage({ id: 'admin.fields.event.country' }),
    themes: intl.formatMessage({ id: 'event.import.theme' }),
    projects: intl.formatMessage({ id: 'global.project.label' }),
    districts: intl.formatMessage({ id: 'global.zones' }),
    enabled: intl.formatMessage({ id: 'global.publication' }),
    commentable: intl.formatMessage({ id: 'admin.fields.proposal.comments' }),
    metaDescription: intl.formatMessage({ id: 'event.import.metadescription' }),
    customCode: intl.formatMessage({ id: 'event.import.customcode' }),
    link: intl.formatMessage({ id: 'project_download.label.link' }),
  }
}

export const onSubmit = (data: AddEventsInput, onClose: () => void, intl: IntlShape) => {
  const input = {
    ...data,
    dryRun: false,
  }

  return AddEventsMutation.commit({ input }).then(() => {
    onClose()
    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'events-successfully-imported' }),
    })
  })
}

const EventImportModal: React.FC = () => {
  const intl = useIntl()
  const [data, setData] = React.useState<AddEventsInput>()
  const [loading, setLoading] = React.useState(false)

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'modal-add-events-via-file' })}
      onClose={() => {
        setLoading(false)
        setData(undefined)
      }}
      disclosure={
        <Button
          id="AdminImportEventsButton-import"
          variant="secondary"
          variantColor="hierarchy"
          variantSize="small"
          mr={6}
        >
          {intl.formatMessage({ id: 'import' })}
        </Button>
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading id="contained-modal-title-lg">
              <Text>{intl.formatMessage({ id: 'modal-add-events-via-file' })}</Text>
            </Heading>
          </Modal.Header>
          <Modal.Body>
            <Box mb={6}>
              <Text mb={2}>{intl.formatMessage({ id: 'import-events-helptext' })}</Text>
              <Text
                sx={{
                  a: { color: 'blue.500' },
                }}
              >
                <FormattedHTMLMessage
                  id="csv-file-helptext"
                  values={{
                    link: '/import-event-csv-template',
                  }}
                />
              </Text>
            </Box>
            <ImportEventsForm setData={setData} loading={loading} setLoading={setLoading} />
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                id="AdminImportEventsButton-submit"
                variantSize="medium"
                variant="primary"
                variantColor="primary"
                disabled={!data}
                onClick={async () => {
                  if (data) {
                    await onSubmit(data, hide, intl)
                  }
                }}
              >
                {intl.formatMessage({ id: 'import' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default EventImportModal
