// @flow
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { FormattedHTMLMessage, useIntl, type IntlShape } from 'react-intl';
import styled from 'styled-components';
import { Field, reduxForm, submit } from 'redux-form';
import { useSelector } from 'react-redux';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import { ICON_NAME } from '~ds/Icon/Icon';
import UpdateProjectSlugMutation from '~/mutations/UpdateProjectSlugMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { toast } from '~ds/Toast';
import renderComponent from '~/components/Form/Field';
import type { Dispatch } from '~/types';
import type { UpdateSlugModal_project$key } from '~relay/UpdateSlugModal_project.graphql';

const FRAGMENT = graphql`
  fragment UpdateSlugModal_project on Project {
    slug
    url
  }
`;

const Label = styled.label`
  font-weight: 400;
  color: #272b30;
  font-size: 14px;
`;

type Props = {|
  +project: ?UpdateSlugModal_project$key,
  +intl: IntlShape,
  +projectId: string,
  +show: boolean,
  +onClose: () => void,
|};

type FormValues = {|
  +slug: string,
  +agree: boolean,
|};

const formName = 'update-slug-form';

const asyncValidate = (values: FormValues) => {
  return new Promise((resolve, reject) => {
    const errors = {};
    if (!values.slug) {
      errors.slug = 'please-fill-a-slug';
      return reject(errors);
    }
    return resolve();
  });
};

const validate = (values: FormValues) => {
  const errors = {};
  if (!values.agree) {
    errors.agree = 'field-is-required';
  }
  return errors;
};

const onSubmit = (formValues: FormValues, dispatch: Dispatch, props: Props) => {
  const { intl, projectId, onClose } = props;
  const input = {
    projectId,
    slug: formValues.slug,
  };
  return UpdateProjectSlugMutation.commit({ input }).then(response => {
    onClose();
    if (response.updateProjectSlug?.errorCode) {
      return mutationErrorToast(intl);
    }
    toast({
      variant: 'success',
      content: intl.formatMessage({
        id: 'your-slug-has-been-updated',
      }),
    });
  });
};

const UpdateSlugModal = ({
  project: projectFragment,
  show,
  onClose,
  handleSubmit,
  dispatch,
  pristine,
  submitting,
}: {
  ...Props,
  ...ReduxFormFormProps,
}) => {
  const project = useFragment(FRAGMENT, projectFragment);
  const intl = useIntl();
  const agree = useSelector(state => state.form[formName].values.agree);
  const slug = useSelector(state => state.form[formName].values.slug);

  const disabledSubmitButton = !agree || !slug || pristine;

  if (!project) return null;

  return (
    <Modal
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage({ id: 'update-project-slug' })}>
      <form id={formName} onSubmit={handleSubmit}>
        <Modal.Header borderBottom="normal" borderColor="gray.200" pb={6}>
          <Text fontWeight={600} color="blue.900" fontSize={4}>
            {intl.formatMessage({ id: 'update-project-slug' })}
          </Text>
        </Modal.Header>
        <Modal.Body>
          <AppBox mb={8}>
            <Text>{intl.formatMessage({ id: 'my-permalink' })}</Text>
            <Text color="gray.500">{project?.url}</Text>
          </AppBox>

          <AppBox mb={2}>
            <Text fontWeight={700}>{intl.formatMessage({ id: 'update-slug-consequences' })}</Text>
            <ul>
              <li>
                <FormattedHTMLMessage id="project-urls-will-no-longer-work" />
              </li>
              <li>
                <FormattedHTMLMessage
                  id="data-related-to-this-slug-will-be-lost"
                  values={{ slug: project?.slug }}
                />
              </li>
            </ul>
          </AppBox>

          <Flex direction="column" mb={4}>
            <Label htmlFor="slug">{intl.formatMessage({ id: 'my-slug' })}</Label>
            <Field id="slug" type="text" name="slug" component={renderComponent} />
          </Flex>

          <Flex mb={2} mr={2}>
            <Field type="checkbox" id="agree" name="agree" component={renderComponent}>
              <Label htmlFor="agree">
                {intl.formatMessage({ id: 'understood-cannot-cancel' })}
              </Label>
            </Field>
          </Flex>
        </Modal.Body>
        <Modal.Footer
          justifyContent="space-between"
          borderTop="normal"
          borderColor="gray.200"
          pt={6}>
          <Flex align="center">
            <Button
              leftIcon={ICON_NAME.CIRCLE_INFO}
              variant="tertiary"
              color="blue.500"
              fontWeight={600}
              ml={1}
              onClick={() =>
                window.open(
                  'https://aide.cap-collectif.com/article/276-modification-du-lien-dun-projet',
                  '_blank',
                )
              }>
              {intl.formatMessage({ id: 'information' })}
            </Button>
          </Flex>
          <ButtonGroup>
            <Button
              variant="secondary"
              variantSize="big"
              variantColor="hierarchy"
              onClick={() => onClose()}>
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button
              variant="primary"
              disabled={disabledSubmitButton}
              isLoading={submitting}
              variantSize="big"
              onClick={() => {
                dispatch(submit(formName));
              }}>
              {intl.formatMessage({ id: 'global.validate' })}
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

const form = reduxForm({
  onSubmit,
  form: formName,
  asyncValidate,
  validate,
})(UpdateSlugModal);

function injectProp(Component) {
  return function WrapperComponent(props: Props) {
    const { project: projectFragment } = props;
    const project = useFragment(FRAGMENT, projectFragment);

    const initialValues = {
      slug: project?.slug,
      agree: false,
    };

    return <Component {...props} initialValues={initialValues} />;
  };
}

const container = injectProp(form);
export default container;
