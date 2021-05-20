// @flow
import * as React from 'react';
import { createFragmentContainer, graphql, type RelayFragmentContainer } from 'react-relay';
import { useIntl } from 'react-intl';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import Modal from '~ds/Modal/Modal';
import type { ModalArgumentAuthorMenu_argument } from '~relay/ModalArgumentAuthorMenu_argument.graphql';
import ModalEditArgumentMobile from '~/components/Debate/Page/Arguments/ModalEditArgumentMobile';
import ModalDeleteArgumentMobile from '~/components/Debate/Page/Arguments/ModalDeleteArgumentMobile';

type Props = {|
  argument: ModalArgumentAuthorMenu_argument,
|};

export const ModalArgumentAuthorMenu = ({ argument }: Props): React.Node => {
  const intl = useIntl();

  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'global.menu' })}
      disclosure={
        <Button
          rightIcon={ICON_NAME.MORE}
          aria-label={intl.formatMessage({ id: 'global.menu' })}
          color="gray.500"
        />
      }>
      {({ hide: hideModalMenu }) => (
        <Modal.Body spacing={6} p={6}>
          <ModalEditArgumentMobile argument={argument} hidePreviousModal={hideModalMenu} />
          <ModalDeleteArgumentMobile argument={argument} hidePreviousModal={hideModalMenu} />
        </Modal.Body>
      )}
    </Modal>
  );
};

export default (createFragmentContainer(ModalArgumentAuthorMenu, {
  argument: graphql`
    fragment ModalArgumentAuthorMenu_argument on AbstractDebateArgument {
      ...ModalEditArgumentMobile_argument
      ...ModalDeleteArgumentMobile_argument
    }
  `,
}): RelayFragmentContainer<typeof ModalArgumentAuthorMenu>);
