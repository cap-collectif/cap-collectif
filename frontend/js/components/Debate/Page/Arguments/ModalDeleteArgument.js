// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { type IntlShape, useIntl } from 'react-intl';
import { useAnalytics } from 'use-analytics';
import { toast } from '@cap-collectif/ui'
import DeleteDebateArgumentMutation from '~/mutations/DeleteDebateArgumentMutation';
import DeleteDebateAnonymousArgumentMutation from '~/mutations/DeleteDebateAnonymousArgumentMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { formatConnectionPath } from '~/shared/utils/relay';
import { mediaQueryMobile } from '~/utils/sizes';
import DeleteModal from '~/components/Modal/DeleteModal';
import CookieMonster from '~/CookieMonster';

type Props = {|
  onClose: () => void,
  argumentInfo: { id: string, type: 'FOR' | 'AGAINST', debateUrl: string, hash?: ?string },
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
  argumentInfo: { id: string, type: 'FOR' | 'AGAINST', debateUrl: string, hash?: ?string },
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
  ];

  return argumentInfo.hash
    ? DeleteDebateAnonymousArgumentMutation.commit({
        input: {
          debate: debateId,
          hash: argumentInfo.hash,
        },
        connections,
        debateId,
      })
        .then(response => {
          onClose();
          if (response.deleteDebateAnonymousArgument?.errorCode) {
            mutationErrorToast(intl);
          }
          CookieMonster.removeDebateAnonymousArgumentCookie(debateId);
          toast({
            variant: 'success',
            content: intl.formatMessage({
              id: 'alert.success.delete.argument',
            }),
          });
        })
        .catch(() => {
          mutationErrorToast(intl);
        })
    : DeleteDebateArgumentMutation.commit({
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

export const ModalDeleteArgument = ({ argumentInfo, debateId, onClose }: Props): React.Node => {
  const intl = useIntl();
  const { track } = useAnalytics();

  return (
    <ModalContainer
      closeDeleteModal={onClose}
      showDeleteModal={!!argumentInfo}
      deleteElement={() => {
        track('debate_argument_delete', {
          url: argumentInfo.debateUrl,
        });
        onSubmit(argumentInfo, debateId, intl, onClose);
      }}
      deleteModalTitle="argument.delete.subtitle"
      deleteModalContent="group-admin-parameters-modal-delete-content"
    />
  );
};

export default ModalDeleteArgument;
