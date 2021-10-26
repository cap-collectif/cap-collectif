// @flow

import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { Field } from 'redux-form';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';
import Text from '~ui/Primitives/Text';
import Select from '~/components/Form/Select';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import type { UserInviteModalStepsChooseRole_groups$key } from '~relay/UserInviteModalStepsChooseRole_groups.graphql';
import component from '~/components/Form/Field';
import { type Step } from '~/components/DesignSystem/ModalSteps/ModalSteps.context';

const FRAGMENT = graphql`
  fragment UserInviteModalStepsChooseRole_groups on Group @relay(plural: true) {
    id
    title
  }
`;

type Props = {|
  ...Step,
  +groups: UserInviteModalStepsChooseRole_groups$key,
|};

export const UserInviteModalStepsChooseRole = ({ groups: groupsFragment }: Props): React.Node => {
  const intl = useIntl();
  const hasProjectAdminFeature = useFeatureFlag('unstable_project_admin');
  const groupsData = useFragment(FRAGMENT, groupsFragment);

  return (
    <Flex direction="column" spacing={2}>
      <Text color="gray.900" mb={2}>
        {intl.formatMessage({ id: 'global.role' })}
      </Text>
      <Field type="radio" component={component} id="user" value="ROLE_USER" name="role">
        {intl.formatMessage({ id: 'roles.user' })}
      </Field>
      {hasProjectAdminFeature && (
        <Field
          type="radio"
          component={component}
          id="project_admin"
          value="ROLE_PROJECT_ADMIN"
          name="role">
          {intl.formatMessage({ id: 'roles.project_admin' })}
        </Field>
      )}
      <Field component={component} type="radio" id="admin" value="ROLE_ADMIN" name="role">
        {intl.formatMessage({ id: 'roles.admin' })}
      </Field>
      <AppBox mb={2}>
        <Text color="gray.900" mr={2}>
          {intl.formatMessage({ id: 'admin.label.group' })}
        </Text>
        <Text color="gray.400">{intl.formatMessage({ id: 'global.optional' })}</Text>
      </AppBox>
      <AppBox>
        <Field
          name="groups"
          component={Select}
          options={groupsData.map(({ id, title }) => {
            return { value: id, label: title };
          })}
          multi
        />
      </AppBox>
    </Flex>
  );
};

export default UserInviteModalStepsChooseRole;
