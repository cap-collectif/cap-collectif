// @flow
import * as React from 'react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';
import css from '@styled-system/css';
import Menu from '~ds/Menu/Menu';
import Button from '~ds/Button/Button';
import Text from '~ui/Primitives/Text';
import { ICON_NAME } from '~ds/Icon/Icon';
import ImportProposalsModal from '~/components/Admin/Project/ImportButton/ImportProposalsModal';
import colors from '~/utils/colors';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

type Props = {|
  +selectedStepId: string,
|};

const ImportButton = ({ selectedStepId }: Props) => {
  const intl = useIntl();
  const { url: baseLinkUrl } = useRouteMatch();
  const hasFeatureImportProposals = useFeatureFlag('import_proposals');
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Menu placement="bottom-start">
        <Menu.Button>
          <Button rightIcon={ICON_NAME.ARROW_DOWN_O} variantSize="small" variant="secondary">
            {intl.formatMessage({ id: 'global.create' })}
          </Button>
        </Menu.Button>
        <Menu.List mt={0}>
          <Menu.ListItem>
            <Text
              as="span"
              css={css({
                a: {
                  textDecoration: 'none',
                  color: colors.darkText,
                },
              })}>
              <a href={`${baseLinkUrl}/${selectedStepId}/create`}>
                {intl.formatMessage({ id: 'create-proposal' })}
              </a>
            </Text>
          </Menu.ListItem>
          {hasFeatureImportProposals && (
            <Menu.ListItem>
              <Text
                onClick={() => {
                  setShowModal(true);
                }}>
                {intl.formatMessage({ id: 'import-csv-proposal' })}
              </Text>
            </Menu.ListItem>
          )}
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
