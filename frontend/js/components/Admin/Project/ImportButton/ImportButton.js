// @flow
import * as React from 'react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import Menu from '~ds/Menu/Menu';
import Button from '~ds/Button/Button';
import Text from '~ui/Primitives/Text';
import { ICON_NAME } from '~ds/Icon/Icon';
import ImportProposalsModal from '~/components/Admin/Project/ImportButton/ImportProposalsModal';

type Props = {|
  selectedStepId: string,
|};

const ImportButton = ({ selectedStepId }: Props) => {
  const intl = useIntl();
  const [showModal, setShowModal] = useState<boolean>(false);
  return (
    <>
      <Menu placement="bottom-start">
        <Menu.Button as={React.Fragment} mr={6}>
          <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variantSize="small" variant="secondary">
            {intl.formatMessage({ id: 'global.create' })}
          </Button>
        </Menu.Button>
        <Menu.List mt={0}>
          <Menu.ListItem>
            <Text>{intl.formatMessage({ id: 'create-proposal' })}</Text>
          </Menu.ListItem>
          <Menu.ListItem>
            <Text
              onClick={() => {
                setShowModal(true);
              }}>
              {intl.formatMessage({ id: 'import-csv-proposal' })}
            </Text>
          </Menu.ListItem>
        </Menu.List>
      </Menu>
      <ImportProposalsModal
        show={showModal}
        selectedStepId={selectedStepId}
        onClose={() => {
          setShowModal(false);
        }}
      />
    </>
  );
};

export default ImportButton;
