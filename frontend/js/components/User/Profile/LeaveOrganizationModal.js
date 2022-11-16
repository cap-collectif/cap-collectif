// @flow
import React from 'react';
import { useIntl } from 'react-intl';
import Modal from '~/components/DesignSystem/Modal/Modal';
import Heading from '~/components/Ui/Primitives/Heading';
import Button from '~/components/DesignSystem/Button/Button';
import Text from '~/components/Ui/Primitives/Text';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import Checkbox from '~/components/Ui/Form/Input/Checkbox/Checkbox';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import LeaveOrganizationMutation from '~/mutations/LeaveOrganizationMutation';
import { toast } from '~/components/DesignSystem/Toast';

type Props = {|
  organizationName: string,
  organizationId: string,
|};

export const LeaveOrganizationModal = ({ organizationId, organizationName }: Props) => {
  const intl = useIntl();

  const [checked, setChecked] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = (hide: () => void) => {
    setIsSubmitting(true);

    return LeaveOrganizationMutation.commit({ input: { organizationId } })
      .then(response => {
        setChecked(false);
        setIsSubmitting(false);
        const errorCode = response.leaveOrganization?.errorCode;
        if (errorCode) {
          hide();
          return mutationErrorToast(intl);
        }
        toast({ variant: 'success', content: intl.formatMessage({ id: 'leave-org-success' }) });
        hide();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch(() => {
        setIsSubmitting(false);
        hide();
        return mutationErrorToast(intl);
      });
  };

  return (
    <Modal
      ariaLabel="global.delete"
      disclosure={
        <Button type="button" color="gray.500">
          {intl.formatMessage({ id: 'global-exit' })}
        </Button>
      }>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'sure-leave-organization' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text mb={2}>
              {intl.formatMessage(
                { id: 'leave-organization-warning' },
                {
                  organization: (
                    <Text as="span" fontWeight={600}>
                      "{organizationName}"
                    </Text>
                  ),
                },
              )}
            </Text>
            <Text mb={4} fontWeight={600} css={{ textDecoration: 'underline' }}>
              {intl.formatMessage({ id: 'warning-action-irreversible' })}
            </Text>
            <Flex alignItems="center">
              <Checkbox
                id="agree-checkbox"
                name="agree-checkbox"
                checked={checked}
                value=""
                onChange={e => setChecked(e.target.checked)}
                label={intl.formatMessage({ id: 'admin.project.delete.confirm' })}
              />
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              variantSize="medium"
              variant="secondary"
              variantColor="hierarchy"
              onClick={() => {
                setChecked(false);
                hide();
              }}>
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button
              ml={4}
              onClick={() => onSubmit(hide)}
              variantSize="medium"
              variant="primary"
              variantColor="danger"
              isLoading={isSubmitting}
              disabled={!checked || isSubmitting}
              type="button">
              {intl.formatMessage({ id: 'leave-organization' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default LeaveOrganizationModal;
