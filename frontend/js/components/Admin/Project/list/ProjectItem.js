// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { IntlShape } from 'react-intl';
import Td from '~ds/Table/Td';
import Link from '~ds/Link/Link';
import Text from '~ui/Primitives/Text';
import Flex from '~ui/Primitives/Layout/Flex';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import colors from '~/styles/modules/colors';
import type {
  ProjectItem_project,
  ProjectItem_project$key,
} from '~relay/ProjectItem_project.graphql';
import Tag from '~ds/Tag/Tag';
import Menu from '../../../DesignSystem/Menu/Menu';
import ProjectModalConfirmationDelete from '~/components/Admin/Project/list/ProjectModalConfirmationDelete';
import ProjectModalExportSteps from '~/components/Admin/Project/list/ProjectModalExportSteps';
import DuplicateProjectMutation from '~/mutations/DuplicateProjectMutation';
import { toast } from '~ds/Toast';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';

type Props = {|
  +project: ProjectItem_project$key,
  +connectionName: string,
  +isSuperAdmin?: boolean,
  +isOnlyProjectAdmin?: boolean,
|};

const FRAGMENT = graphql`
  fragment ProjectItem_project on Project {
    id
    title
    themes {
      id
      title
      url
    }
    owner {
      id
      username
      url
    }
    visibility
    publishedAt
    url
    adminAlphaUrl
    exportContributorsUrl
    exportableSteps {
      id
    }
    ...ProjectModalConfirmationDelete_project
    ...ProjectModalExportSteps_project
  }
`;

const onDuplicate = (
  intl: IntlShape,
  duplicatedProject: ProjectItem_project,
  connectionName: string,
) => {
  const input = {
    id: duplicatedProject.id,
  };
  DuplicateProjectMutation.commit(
    {
      input,
      connections: [connectionName],
    },
    duplicatedProject,
    intl,
  )
    .then(() =>
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'project.successfully.duplicated' }),
      }),
    )
    .catch(() => mutationErrorToast(intl));
};
const ProjectItem = ({
  project: projectFragment,
  connectionName,
  isSuperAdmin,
  isOnlyProjectAdmin,
}: Props): React.Node => {
  const project = useFragment(FRAGMENT, projectFragment);
  const intl = useIntl();

  return (
    <React.Fragment>
      <Td>
        <Flex direction="column">
          {project && project.title && project.adminAlphaUrl && (
            <Link truncate={128} href={project.adminAlphaUrl}>
              {project.title}
            </Link>
          )}
          <Flex direction="row" color="gray.500">
            {!!project?.themes &&
              !!project?.themes?.length &&
              project?.themes?.length > 0 &&
              project?.themes?.map((theme, index) => {
                if (theme && theme.title && theme.url && project?.themes?.length) {
                  if (index + 1 < project?.themes?.length) {
                    return (
                      <React.Fragment key={theme.url}>
                        <Link href={theme?.url} color={`${colors.gray['500']}!important`}>
                          {theme?.title}
                        </Link>
                        <span>, &nbsp; </span>
                      </React.Fragment>
                    );
                  }
                  return (
                    <Link
                      key={theme.url}
                      href={theme?.url}
                      color={`${colors.gray['500']}!important`}>
                      {theme?.title}
                    </Link>
                  );
                }
              })}
          </Flex>
        </Flex>
      </Td>
      <Td>
        {project?.owner?.id && (
          <Link key={project?.owner?.id} href={project?.owner?.url}>
            {project?.owner?.username}
          </Link>
        )}
      </Td>
      <Td>
        {project.visibility === 'PUBLIC' && (
          <Tag variant="green">{intl.formatMessage({ id: 'public-everybody' })}</Tag>
        )}
        {project.visibility === 'CUSTOM' && (
          <Tag variant="aqua">{intl.formatMessage({ id: 'global.customized' })}</Tag>
        )}
        {project.visibility === 'ME' && project.visibility === 'ADMIN' && (
          <Tag variant="gray">{intl.formatMessage({ id: 'private' })}</Tag>
        )}
      </Td>

      <Td>
        {project.publishedAt &&
          intl.formatDate(project.publishedAt, {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })}
      </Td>
      <Td>
        <Menu>
          <Menu.Button>
            <ButtonQuickAction
              icon="MORE"
              size="md"
              variantColor="primary"
              label={intl.formatMessage({ id: 'global.plus' })}
              style={{ opacity: 0 }}
            />
          </Menu.Button>
          <Menu.List>
            <Menu.ListItem onClick={() => window.open(project.url, '_self')}>
              <Text> {intl.formatMessage({ id: 'action_show' })} </Text>
            </Menu.ListItem>
            {(!!project.exportContributorsUrl ||
              (!!project.exportableSteps && project.exportableSteps.length > 0)) && (
              <ProjectModalExportSteps
                project={project}
                intl={intl}
                isOnlyProjectAdmin={isOnlyProjectAdmin}
              />
            )}

            {isSuperAdmin && (
              <Menu.ListItem
                onClick={() => {
                  onDuplicate(intl, project, connectionName);
                }}>
                <Text> {intl.formatMessage({ id: 'duplicate' })} </Text>
              </Menu.ListItem>
            )}
            <ProjectModalConfirmationDelete project={project} connectionName={connectionName} />
          </Menu.List>
        </Menu>
      </Td>
    </React.Fragment>
  );
};

export default ProjectItem;
