// @flow
import * as React from 'react';
import type { IntlShape } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import { Field, reduxForm, reset } from 'redux-form';
import { ConnectionHandler } from 'relay-runtime';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Flex from '~ui/Primitives/Layout/Flex';
import component from '~/components/Form/Field';
import select from '~/components/Form/Select';
import type { ProjectModalCreateProject_query$key } from '~relay/ProjectModalCreateProject_query.graphql';
import type { Dispatch } from '~/types';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { toast } from '~ds/Toast';
import formatSubmitted from '~/utils/form/formatSubmitted';
import CreateProjectMutation from '~/mutations/CreateProjectMutation';

const formName = 'form-create-project';

type FormValues = {|
  +title: string,
  +author?: ?any,
  +type?: ?string,
|};
type PropsBefore = {|
  +intl: IntlShape,
  +viewerId: string,
  +isAdmin: boolean,
  +isOnlyProjectAdmin?: boolean,
  +orderBy: string,
  +term: string,
  +query: ?ProjectModalCreateProject_query$key,
  +initialValues: FormValues,
  +noResult?: boolean,
|};

type Props = {|
  ...ReduxFormFormProps,
  ...PropsBefore,
|};

const FRAGMENT = graphql`
  fragment ProjectModalCreateProject_query on Query {
    projectTypes {
      id
      title
    }
    users {
      edges {
        node {
          id
          username
        }
      }
    }
  }
`;
const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const input = {
    projectType: values.type,
    title: values.title,
    authors: formatSubmitted(values.author),
  };

  return CreateProjectMutation.commit(
    {
      input,
      connections: [
        ConnectionHandler.getConnectionID(props.viewerId, 'ProjectList_projects', {
          query: props.term || null,
          affiliations: props.isAdmin ? null : ['OWNER'],
          orderBy: { field: 'PUBLISHED_AT', direction: props.orderBy },
        }),
      ],
    },
    props.isAdmin,
    props.isOnlyProjectAdmin,
  )
    .then(response => {
      if (!response.createProject?.project) {
        return mutationErrorToast(props.intl);
      }
      toast({
        variant: 'success',
        content: props.intl.formatMessage({ id: 'project-successfully-created' }),
      });
      dispatch(reset(formName));
    })
    .catch(() => mutationErrorToast(props.intl));
};
const onValidate = (values: FormValues) => {
  const errors = {};

  if (!values.title || values.title.length === 0) {
    errors.title = 'fill-field';
  }
  if (!values.author || values.author.length === 0) {
    errors.author = 'fill-field';
  }
  return errors;
};
const ProjectModalCreateProject = ({
  handleSubmit,
  submitting,
  intl,
  query: queryReference,
  noResult,
  isOnlyProjectAdmin,
}: Props): React.Node => {
  const data = useFragment(FRAGMENT, queryReference);
  const loadAuthorOptions = () =>
    data?.users?.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .filter(Boolean)
      .map(user => ({
        value: user.id,
        label: user.username,
      }));
  return (
    <Modal
      overflow="visible"
      overflowY="visible"
      ariaLabel={intl.formatMessage({ id: 'create-a-project' })}
      disclosure={
        <Button
          variant="primary"
          variantColor="primary"
          variantSize={noResult ? 'big' : 'small'}
          leftIcon="ADD"
          mr={8}>
          {intl.formatMessage({ id: 'create-a-project' })}
        </Button>
      }>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'create-a-project' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Flex as="form" direction="column" spacing={3}>
              <Field
                name="title"
                label={
                  <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                    {intl.formatMessage({ id: 'global.title' })}
                  </Text>
                }
                placeholder={intl.formatMessage({ id: 'admiun.project.create.title.placeholder' })}
                component={component}
                type="text"
              />
              <Field
                selectFieldIsObject
                name="author"
                id="author"
                label={
                  <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                    {intl.formatMessage({ id: 'global.author' })}
                  </Text>
                }
                multi
                aria-autocomplete="list"
                aria-haspopup="true"
                role="combobox"
                disabled={isOnlyProjectAdmin}
                debounce
                required
                autoload
                component={select}
                clearable
                loadOptions={loadAuthorOptions}
              />

              <Field
                name="type"
                label={
                  <Text fontSize={3} fontWeight="normal" color="gray.900">
                    {intl.formatMessage({ id: 'admin.fields.project.type.title' })}
                  </Text>
                }
                component={select}
                disabled={false}
                placeholder={intl.formatMessage({ id: 'admin.fields.menu_item.parent_empty' })}
                type="select"
                options={data?.projectTypes?.filter(Boolean).map(type => ({
                  value: type.id,
                  label: intl.formatMessage({ id: type.title }),
                }))}
              />
            </Flex>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button
                variantSize="medium"
                variant="secondary"
                variantColor="hierarchy"
                onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                onClick={() => {
                  handleSubmit();
                  hide();
                }}
                disabled={submitting}
                variantSize="medium"
                variant="primary"
                variantColor="primary">
                {intl.formatMessage({ id: 'global.create' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};
export default (reduxForm({
  onSubmit,
  validate: onValidate,
  form: formName,
})(ProjectModalCreateProject): React.AbstractComponent<PropsBefore>);
