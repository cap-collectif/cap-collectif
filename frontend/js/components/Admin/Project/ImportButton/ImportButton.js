// @flow
import * as React from 'react';
import { useState } from 'react';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';
import { reset, submit } from 'redux-form';
import css from '@styled-system/css';
import Menu from '~ds/Menu/Menu';
import Button from '~ds/Button/Button';
import Text from '~ui/Primitives/Text';
import { ICON_NAME } from '~ds/Icon/Icon';
import type { Dispatch } from '~/types';
import ImportProposalsFromCsvModal, {
  formName,
} from '~/components/Admin/Project/ImportButton/ImportProposalsFromCsvModal';
import colors from '~/utils/colors';
import AddProposalsFromCsvMutation from '~/mutations/AddProposalsFromCsvMutation';
import type { AddProposalsFromCsvMutationResponse } from '~relay/AddProposalsFromCsvMutation.graphql';
import { toast } from '~ds/Toast';
import type { ProposalsStepValues } from '~/components/Admin/Project/ProjectAdminPage.reducer';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import { useProjectAdminProposalsContext } from '~/components/Admin/Project/ProjectAdminPage.context';

type Props = {|
  proposalFormId: string,
  selectedStepId: ProposalsStepValues,
  projectId: string,
  viewerIsAdmin: boolean,
|};

type FormValue = {|
  csvProposals: {
    csvToImport: string,
    badLines?: {
      num: number,
      lines: string,
      last: string,
    },
    duplicates?: {
      num: number,
      lines: string,
      last: number,
    },
    mandatoryMissing?: {
      num: number,
      lines: string,
      last: number,
    },
    importableProposals?: {
      num: number,
    },
    errorCode?: string,
  },
|};

const ImportButton = ({ proposalFormId, selectedStepId, projectId, viewerIsAdmin }: Props) => {
  const intl = useIntl();
  const { url: baseLinkUrl } = useRouteMatch();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [failOneTime, setFailOneTime] = useState<boolean>(false);
  const proposalRevisionsEnabled = useFeatureFlag('proposal_revisions');
  const { parameters } = useProjectAdminProposalsContext();

  if (!selectedStepId) {
    return null;
  }

  const submitImportProposalsVerified = (values: FormValue, dispatch: Dispatch) => {
    const input = {
      csvToImport: values.csvProposals.csvToImport,
      proposalFormId,
      dryRun: false,
      delimiter: ';',
    };
    return AddProposalsFromCsvMutation.commit({
      input,
      proposalRevisionsEnabled,
      isAdminView: true,
      step: selectedStepId,
      projectId,
      parameters,
    })
      .then((response: AddProposalsFromCsvMutationResponse) => {
        setShowModal(false);
        if (response.addProposalsFromCsv && response.addProposalsFromCsv.importedProposals) {
          dispatch(reset(formName));
          toast({
            variant: 'success',
            content: (
              <FormattedHTMLMessage
                id="success-proposals-imported"
                values={{ num: response.addProposalsFromCsv?.importedProposals?.totalCount || 0 }}
              />
            ),
          });
        } else {
          toast({
            variant: 'danger',
            content: failOneTime ? (
              <FormattedHTMLMessage id="error-again-contact-assist" />
            ) : (
              <div>
                <Button
                  onClick={() => {
                    dispatch(submit(formName));
                  }}>
                  <FormattedHTMLMessage id="import-failed-retry" />
                </Button>
              </div>
            ),
          });
          setFailOneTime(true);
        }
      })
      .catch(() => {
        setShowModal(false);
        toast({
          variant: 'danger',
          content: failOneTime ? (
            <FormattedHTMLMessage id="error-again-contact-assist" />
          ) : (
            <div>
              <Button
                onClick={() => {
                  dispatch(submit(formName));
                }}>
                {intl.formatMessage({ id: 'import-failed-retry' })}
              </Button>
            </div>
          ),
        });
        setFailOneTime(true);
      });
  };

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
      <ImportProposalsFromCsvModal
        show={showModal}
        proposalFormId={proposalFormId}
        selectedStepId={selectedStepId}
        projectId={projectId}
        viewerIsAdmin={viewerIsAdmin}
        onSubmit={submitImportProposalsVerified}
        onClose={() => {
          setShowModal(false);
        }}
      />
    </>
  );
};

export default ImportButton;
