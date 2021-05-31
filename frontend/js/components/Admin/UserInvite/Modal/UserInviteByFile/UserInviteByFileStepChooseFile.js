// @flow

import * as React from 'react';
import { useState } from 'react';
import type { DropzoneFile } from 'react-dropzone';
import { useIntl } from 'react-intl';
import { CsvDropZoneInput } from '~/components/Utils/CsvDropZoneInput';
import { csvToArray } from '~/utils/csvToArray';
import { useUserInviteModalContext } from '~/components/Admin/UserInvite/Modal/UserInviteModal.context';
import { isEmail } from '~/services/Validator';
import useBoolean from '~/utils/hooks/useBoolean';
import Heading from '~ui/Primitives/Heading';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import { ModalBody } from '~/components/Admin/UserInvite/UserInviteAdminPage.style';

type Props = {|
  +onCloseButtonClick?: () => void,
|};

type EmailInput = {| importedUsers: string[], notFoundEmails: string[] |};

const getInputFromFile = (content: string): EmailInput => {
  const rows = [...new Set(csvToArray(content))].filter(Boolean);
  const mails = rows.filter(isEmail);
  const invalid = rows.filter(mail => !isEmail(mail));

  return {
    importedUsers: mails,
    notFoundEmails: invalid,
  };
};

export const UserInviteByFileStepChooseFile = ({ onCloseButtonClick }: Props): React.Node => {
  const { dispatch } = useUserInviteModalContext();
  const intl = useIntl();
  const [showMoreError, toggleShowMoreError] = useBoolean();
  const [emails, setEmails] = useState<EmailInput>({
    importedUsers: [],
    notFoundEmails: [],
  });
  const [file, setFile] = useState<?DropzoneFile>(null);
  const isValid = emails.importedUsers.length > 0;

  const onSubmit = async () => {
    if (!isValid) return;
    dispatch({ type: 'GOTO_ROLE_STEP', payload: emails.importedUsers });
  };
  return (
    <>
      <Modal.Header pb={6}>
        <Heading>{intl.formatMessage({ id: 'invite-via-file' })}</Heading>
      </Modal.Header>
      <ModalBody>
        <CsvDropZoneInput
          input={{
            name: 'emails',
            value: emails,
          }}
          name="emails"
          showMoreError={showMoreError}
          onClickShowMoreError={toggleShowMoreError}
          meta={{
            asyncValidating: false,
          }}
          onPostDrop={files => {
            if (files.length > 0) {
              const reader = new window.FileReader();
              reader.onload = () => {
                setEmails(getInputFromFile(reader.result));
              };
              reader.onabort = () => setFile(null);
              reader.onerror = () => setFile(null);
              reader.readAsText(files[0]);
              setFile(files[0]);
            }
          }}
          disabled={false}
          currentFile={file}
        />
      </ModalBody>
      <Modal.Footer as="div" pt={6}>
        <ButtonGroup>
          <Button
            variant="tertiary"
            onClick={onCloseButtonClick}
            variantSize="big"
            variantColor="hierarchy">
            {intl.formatMessage({ id: 'global.close' })}
          </Button>
          <Button disabled={!isValid} variant="primary" variantSize="big" onClick={onSubmit}>
            {intl.formatMessage({ id: 'global.next' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </>
  );
};

export default UserInviteByFileStepChooseFile;
