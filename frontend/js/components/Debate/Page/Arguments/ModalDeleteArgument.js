// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { type IntlShape, useIntl } from 'react-intl';
import DeleteDebateArgumentMutation from '~/mutations/DeleteDebateArgumentMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { toast } from '~ds/Toast';
import { formatConnectionPath } from '~/shared/utils/relay';
import { mediaQueryMobile } from '~/utils/sizes';
import DeleteModal from '~/components/Modal/DeleteModal';

type Props = {|
  onClose: () => void,
  argumentInfo: { id: string, type: 'FOR' | 'AGAINST' },
  debateId: string,
|};

const ModalContainer: StyledComponent<{}, {}, typeof DeleteModal> = styled(DeleteModal)`
  .modal-dialog {
    width: 40%;
  }

  .modal-title {
    font-weight: 600;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    .modal-dialog {
      width: auto;
    }
  }
`;

const onSubmit = (
  argumentInfo: { id: string, type: 'FOR' | 'AGAINST' },
  debateId: string,
  intl: IntlShape,
  onClose: () => void,
) => {
  const connections = [
    formatConnectionPath(
      ['client', debateId],
      'DebateStepPageArgumentsPagination_arguments',
      `(value:"${argumentInfo.type}")`,
    ),
    formatConnectionPath(
      ['client', debateId],
      'DebateStepPageAlternateArgumentsPagination_alternateArguments',
    ),
  ];

  return DeleteDebateArgumentMutation.commit({
    input: {
      id: argumentInfo.id,
    },
    connections,
    debateId,
  })
    .then(response => {
      onClose();
      if (response.deleteDebateArgument?.errorCode) {
        mutationErrorToast(intl);
      }

      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'alert.success.delete.argument',
        }),
      });
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

export const ModalDeleteArgument = ({ argumentInfo, debateId, onClose }: Props) => {
  const intl = useIntl();
  return (
    <ModalContainer
      closeDeleteModal={onClose}
      showDeleteModal={!!argumentInfo}
      deleteElement={() => {
        onSubmit(argumentInfo, debateId, intl, onClose);
      }}
      deleteModalTitle="argument.delete.subtitle"
      deleteModalContent="group-admin-parameters-modal-delete-content"
    />
  );
};

export default ModalDeleteArgument;
