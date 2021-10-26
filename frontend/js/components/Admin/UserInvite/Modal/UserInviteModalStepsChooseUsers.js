// @flow
import * as React from 'react';
import { useState } from 'react';
import { type IntlShape, useIntl } from 'react-intl';
import type { DropzoneFile } from 'react-dropzone';
import { change, Field } from 'redux-form';
import { fetchQuery, graphql } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import { CsvDropZoneInput } from '~/components/Utils/CsvDropZoneInput';
import { csvToArray } from '~/utils/csvToArray';
import { isEmail } from '~/services/Validator';
import type { Dispatch } from '~/types';
import component from '~/components/Form/Field';
import { type Step } from '~/components/DesignSystem/ModalSteps/ModalSteps.context';
import environment from '~/createRelayEnvironment';
import { emailSeparator } from '~/components/Admin/UserInvite/Modal/UserInviteModalSteps';
import InlineList from '~ds/InlineList/InlineList';
import Text from '~ui/Primitives/Text';

type EmailInput = {| duplicateLines: number[], importedUsers: string[], invalidLines: number[] |};

const USER_FETCH_QUERY = graphql`
  query UserInviteModalStepsChooseUsersAvailabilitySearchQuery($emails: [String!]!) {
    userInvitationsAvailabilitySearch(emails: $emails) {
      totalCount
      edges {
        node {
          email
          availableForUser
          availableForInvitation
        }
      }
    }
  }
`;

const getInputFromFile = (content: string): EmailInput => {
  const contentArray = csvToArray(content);
  const rows = [...new Set(contentArray)].filter(Boolean);
  const mails = rows.filter(isEmail);
  const invalidLines = rows
    .filter(mail => !isEmail(mail))
    .map((mail: string) => {
      return rows.indexOf(mail);
    });

  const duplicateLines = mails.reduce((acc, el, i, arr) => {
    if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(i);
    return acc;
  }, []);

  return {
    duplicateLines,
    importedUsers: mails,
    invalidLines,
  };
};

const renderUsedEmails = (usedEmails: String[], intl: IntlShape) => {
  if (usedEmails.length > 0 && usedEmails.length < 5) {
    return (
      <Flex direction="column">
        <Text color="gray.500">
          {intl.formatMessage({ id: 'invitations.already-used-emails' })} &nbsp;
        </Text>
        <InlineList color="gray.500" separator=",">
          {usedEmails.map(email => (
            <Text>{email}</Text>
          ))}
        </InlineList>
      </Flex>
    );
  }
  if (usedEmails.length >= 5) {
    return (
      <Flex color="gray.500">
        {intl.formatMessage(
          { id: 'invitations.already-used-more-emails' },
          { num: usedEmails.length },
        )}
      </Flex>
    );
  }
  return null;
};

type Props = {|
  ...Step,
  +dispatch: Dispatch,
|};

export const UserInviteModalStepsChooseUsers = ({ dispatch }: Props): React.Node => {
  const intl = useIntl();
  const [file, setFile] = useState<?DropzoneFile>(null);
  const [usedEmails, setUsedEmails] = useState([]);

  return (
    <Flex direction="column" spacing={4}>
      <Field
        onChange={(e, value) => {
          const emails = value.split(emailSeparator);
          const formattedInputEmails = emails.filter(email => isEmail(email));
          if (formattedInputEmails.length > 0) {
            fetchQuery(environment, USER_FETCH_QUERY, { emails: formattedInputEmails }).subscribe({
              next: response => {
                const invitationsAvailabilitiesData = response.userInvitationsAvailabilitySearch;
                if (invitationsAvailabilitiesData.totalCount > 0) {
                  const duplicateEmails = invitationsAvailabilitiesData.edges.map(item => {
                    return item.node.email;
                  });
                  setUsedEmails(duplicateEmails);
                }
              },
            });
          }
        }}
        label={intl.formatMessage({ id: 'entering-email-addresses' })}
        id="inputEmails"
        type="text"
        name="inputEmails"
        placeholder="enter-email-address"
        component={component}
      />
      {renderUsedEmails(usedEmails, intl)}
      <Text fontWeight={400}>{intl.formatMessage({ id: 'import-csv-file' })}</Text>
      <Field
        name="csvEmails"
        component={CsvDropZoneInput}
        meta={{
          asyncValidating: false,
        }}
        onPostDrop={files => {
          if (files.length > 0) {
            const reader = new window.FileReader();
            reader.onload = () => {
              dispatch(
                change('form-user-invitation', 'csvEmails', getInputFromFile(reader.result)),
              );
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
    </Flex>
  );
};

export default UserInviteModalStepsChooseUsers;
