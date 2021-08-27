// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import Heading from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';
import SpotIcon, { SPOT_ICON_NAME } from '~ds/SpotIcon/SpotIcon';
import ModalCreateProposalForm from '~/components/Admin/Project/ProposalFormList/ModalCreateProposalForm';

type Props = {|
  +isAdmin: boolean,
  +viewerId: string,
  +term: string,
  +orderBy: string,
|};

const NoResult = ({ isAdmin, viewerId, term, orderBy }: Props): React.Node => {
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);

  return (
    <Flex
      direction="row"
      spacing={8}
      bg="white"
      py="96px"
      px="111px"
      mt={6}
      mx={6}
      borderRadius="normal">
      <SpotIcon name={SPOT_ICON_NAME.FORM} size="lg" />

      <Flex direction="column" color="blue.900" align="flex-start" maxWidth="20%">
        <Heading as="h3" mb={2}>
          {intl.formatMessage({ id: 'publish-first-proposal-form' })}
        </Heading>
        <Text mb={8} maxWidth="80%">
          {intl.formatMessage({ id: 'proposal-form-description' })}
        </Text>

        <>
          <Button
            variant="primary"
            variantColor="primary"
            variantSize="medium"
            leftIcon="ADD"
            onClick={onOpen}>
            {intl.formatMessage({ id: 'create-form' })}
          </Button>
          <ModalCreateProposalForm
            viewerId={viewerId}
            intl={intl}
            isAdmin={isAdmin}
            term={term}
            orderBy={orderBy}
            onClose={onClose}
            show={isOpen}
          />
        </>
      </Flex>
    </Flex>
  );
};

export default NoResult;
