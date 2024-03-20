import { FC } from 'react'
import { Button, CapUIModalSize, Heading, Modal, Text, toast } from '@cap-collectif/ui'
import { IntlShape, useIntl } from 'react-intl'

import DeleteGlobalDistrictMutation from '@mutations/DeleteGlobalDistrictMutation'
import { mutationErrorToast } from '@utils/mutation-error-toast'

const deleteGeographicalArea = (id: string, intl: IntlShape, fromDistrict: boolean): void => {
  DeleteGlobalDistrictMutation.commit({
    input: { id },
  }).then(response => {
    if (!response?.deleteGlobalDistrict?.deletedDistrictId) {
      return mutationErrorToast(intl)
    }
    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'area-deleted' }),
    })
    if (fromDistrict) window.location.href = '/admin-next/geographicalAreas'
  })
}

type GeographicalAreaDeleteModalProps = {
  show: boolean
  geographicalAreaId: string | null
  onClose: () => void
  fromDistrict?: boolean
}

const GeographicalAreaDeleteModal: FC<GeographicalAreaDeleteModalProps> = ({
  show,
  geographicalAreaId,
  onClose,
  fromDistrict = false,
}) => {
  const intl = useIntl()

  if (!geographicalAreaId || !show) return null

  return (
    <Modal
      show={show}
      onClose={onClose}
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'sure-to-delete-geo-area' })}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'sure-to-delete-geo-area' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text mt={1} mb={2}>
          {intl.formatMessage({ id: 'delete-geo-area-text' })}
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onClose} variant="secondary" variantSize="big" variantColor="hierarchy">
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          type="button"
          variantColor="danger"
          variantSize="big"
          onClick={() => {
            deleteGeographicalArea(geographicalAreaId, intl, fromDistrict)
            onClose()
          }}
        >
          {intl.formatMessage({ id: 'action_delete' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default GeographicalAreaDeleteModal
