// @flow
import * as React from 'react';
import { Field, reduxForm, submit, change, FormSection, formValueSelector } from 'redux-form';
import { useDispatch, connect } from 'react-redux';
import { useIntl } from 'react-intl';
import css from '@styled-system/css';
import { graphql, useFragment } from 'react-relay';
import type { IntlShape } from 'react-intl';
import moment from 'moment';
import Flex from '~ui/Primitives/Layout/Flex';
import component from '~/components/Form/Field';
import type { GlobalState, Dispatch } from '~/types';
import Accordion from '~ds/Accordion';
import Panel from '~ds/Accordion/panel';
import AccordionButton from '~ds/Accordion/button';
import Item from '~ds/Accordion/item';
import Text from '~ui/Primitives/Text';
import { type TranslationLocale } from '~relay/PostFormPageQuery.graphql';
import { type PostForm_query$key } from '~relay/PostForm_query.graphql';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Button from '~ds/Button/Button';
import ModalPostDeleteConfirmation from '~/components/Admin/Post/PostForm/ModalPostDeleteConfirmation';
import select from '~/components/Form/Select';
import CreatePostMutation from '~/mutations/CreatePostMutation';
import UpdatePostMutation from '~/mutations/UpdatePostMutation';
import { toast } from '~ds/Toast';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import formatSubmitted from '~/utils/form/formatSubmitted';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import UserListField from '~/components/Admin/Field/UserListField';

type FormValues = {|
  +[key: TranslationLocale]: {
    [key: string]: ?string,
  },
  +author?: ?any,
  +media?: ?any,
  +published_at?: ?string,
  +custom_code?: ?string,
  +has_comments?: ?boolean,
  +is_published?: ?boolean,
  +is_displayed?: ?boolean,
  +languages?: ?string,
  +proposal?: ?string,
  +project?: ?$ReadOnlyArray<{| value: ?string, label: string |}>,
  +theme?: ?$ReadOnlyArray<{| value: ?string, label: string |}>,
  +locales?: ?$ReadOnlyArray<TranslationLocale>,
  +isAdmin?: ?boolean,
  +isProjectAdmin?: ?boolean,
  +isSuperAdmin?: ?boolean,
  +proposalId?: ?string,
  +bodyUsingJoditWysiwyg?: ?boolean,
|};
type OwnProps = {|
  +query: PostForm_query$key,
  +isAdmin: boolean,
  +locales: any,
  +initialValues: FormValues,
  +intl: IntlShape,
|};
type AfterConnectProps = {|
  ...OwnProps,
  +dispatch: Dispatch,
  +bodyUsingJoditWysiwyg?: ?boolean,
|};
type Props = {|
  ...AfterConnectProps,
  ...ReduxFormFormProps,
|};
const formName = 'admin_post_create';

const FRAGMENT = graphql`
  fragment PostForm_query on Query
  @argumentDefinitions(
    affiliations: { type: "[ProjectAffiliation!]" }
    isAdmin: { type: " Boolean!" }
    postId: { type: "ID!" }
  ) {
    post: node(id: $postId) {
      ...ModalPostDeleteConfirmation_post
    }
    viewer {
      isSuperAdmin
      isAdmin
      isProjectAdmin
      projects(affiliations: $affiliations) {
        edges {
          node {
            id
            title
          }
        }
      }
      organizations {
        id
        displayName
      }
    }
    themes @include(if: $isAdmin) {
      id
      title
    }
  }
`;

const onUnload = e => {
  // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
  e.returnValue = true;
};

const onSubmit = (values, dispatch, props) => {
  const translations = props.locales
    .map(locale => {
      const currentTrans = values[locale.code];
      if (currentTrans[`${locale.code}-title`] && currentTrans[`${locale.code}-body`]) {
        return {
          title: currentTrans[`${locale.code}-title`],
          body: currentTrans[`${locale.code}-body`],
          locale: locale.code,
          abstract: currentTrans[`${locale.code}-abstract`],
          metaDescription: currentTrans[`${locale.code}-meta_description`],
        };
      }
    })
    .filter(Boolean);

  const owner = values.author
    ? Array.isArray(values.author)
      ? values.author[0]?.value
      : values.author?.value
    : null;

  if (props.query.post && props.query.post.id) {
    const vals = {
      id: props.query.post.id,
      translations,
      authors: formatSubmitted(values.author),
      media: values.media ? values.media.id : null,
      proposals: values?.proposalId ? [values?.proposalId] : [],
      projects: formatSubmitted(values.project),
      themes: formatSubmitted(values.theme),
      displayedOnBlog: values.is_displayed,
      publishedAt: moment(values.published_at).format('YYYY-MM-DD HH:mm:ss'),
      isPublished: values.is_published,
      commentable: values.has_comments,
      customCode: values.custom_code,
      bodyUsingJoditWysiwyg: values.bodyUsingJoditWysiwyg ?? false,
    };
    return UpdatePostMutation.commit({ input: vals })
      .then(() => {
        window.removeEventListener('beforeunload', onUnload);
        toast({
          variant: 'success',
          content: props.intl.formatMessage({ id: 'post-successfully-updated' }),
        });
      })
      .catch(() => mutationErrorToast(props.intl));
  }
  const vals = {
    translations,
    authors: formatSubmitted(values.author),
    media: values.media ? values.media.id : null,
    proposals: values.proposalId ? [values.proposalId] : [],
    projects: formatSubmitted(values.project),
    themes: formatSubmitted(values.theme),
    displayedOnBlog: values.is_displayed,
    publishedAt: moment(values.published_at).format('YYYY-MM-DD HH:mm:ss'),
    isPublished: values.is_published,
    commentable: values.has_comments,
    customCode: values.custom_code,
    bodyUsingJoditWysiwyg: values.bodyUsingJoditWysiwyg ?? false,
    owner,
  };
  return CreatePostMutation.commit({ input: vals })
    .then(response => {
      window.removeEventListener('beforeunload', onUnload);
      window.open(response.createPost?.post?.adminUrl, '_self');
      toast({
        variant: 'success',
        content: props.intl.formatMessage({ id: 'post-successfully-created' }),
      });
    })
    .catch(() => mutationErrorToast(props.intl));
};

const PostForm = ({
  query,
  isAdmin,
  locales,
  handleSubmit,
  pristine,
  invalid,
  submitting,
  initialValues,
  dirty,
  bodyUsingJoditWysiwyg,
}: Props): React.Node => {
  const intl = useIntl();
  const data = useFragment(FRAGMENT, query);
  const dispatch = useDispatch();
  const { languages } = initialValues;
  const [selectedLocale, setSelectedLocale] = React.useState<string>(languages || '');
  const multiLangue = useFeatureFlag('multilangue');
  const organization = data.viewer.organizations?.[0];

  React.useEffect(() => {
    if (dirty) {
      window.addEventListener('beforeunload', onUnload);
    }
    return () => {
      if (dirty) {
        window.removeEventListener('beforeunload', onUnload);
      }
    };
  }, [dirty]);

  const renderLinkedContent = () => {
    if (data.viewer.isAdmin || data.viewer.isSuperAdmin) {
      return (
        <>
          {initialValues.proposal && (
            <Field
              name="proposal"
              label={
                <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                  {intl.formatMessage({ id: 'admin.post.proposition' })}
                </Text>
              }
              component={component}
              disabled
              type="text"
            />
          )}

          <Field
            name="project"
            id="project"
            label={
              <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                {intl.formatMessage({ id: 'admin.fields.blog_post.projects' })}
              </Text>
            }
            component={select}
            disabled={!!initialValues.proposal}
            multi
            aria-autocomplete="list"
            aria-haspopup="true"
            role="combobox"
            debounce
            autoload
            clearable
            loadOptions={() =>
              data?.viewer?.projects?.edges
                ?.filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(project => ({
                  value: project.id,
                  label: project.title,
                }))
            }
          />
          <React.Fragment>
            <Field
              name="theme"
              id="theme"
              label={
                <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                  {intl.formatMessage({ id: 'admin.fields.blog_post.themes' })}
                </Text>
              }
              component={select}
              multi
              aria-autocomplete="list"
              aria-haspopup="true"
              role="combobox"
              debounce
              autoload
              clearable
              loadOptions={() =>
                data.themes?.filter(Boolean).map(theme => ({
                  value: theme.id,
                  label: theme.title,
                }))
              }
            />

            <Field id="is_displayed" name="is_displayed" component={component} type="checkbox">
              <Text fontSize={3} fontWeight="normal" color="gray.900">
                {intl.formatMessage({ id: 'admin.fields.blog_post.displayedOnBlog' })}
              </Text>
            </Field>
          </React.Fragment>
        </>
      );
    }
    if (data.viewer.isProjectAdmin) {
      return (
        <>
          {initialValues.proposal && (
            <Field
              name="proposal"
              label={
                <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                  {intl.formatMessage({ id: 'admin.post.proposition' })}
                </Text>
              }
              component={component}
              disabled
              type="text"
            />
          )}

          {!initialValues.proposal && (
            <Field
              name="project"
              id="project"
              label={
                <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                  {intl.formatMessage({ id: 'admin.fields.blog_post.projects' })}
                </Text>
              }
              component={select}
              disabled={!!initialValues.proposal}
              multi
              aria-autocomplete="list"
              aria-haspopup="true"
              role="combobox"
              debounce
              autoload
              clearable
              loadOptions={() =>
                data?.viewer?.projects?.edges
                  ?.filter(Boolean)
                  .map(edge => edge.node)
                  .filter(Boolean)
                  .map(project => ({
                    value: project.id,
                    label: project.title,
                  }))
              }
            />
          )}
        </>
      );
    }
    return null;
  };
  return (
    <Flex as="form" align="flex-start" direction="row">
      <Flex
        direction="column"
        width="71%"
        backgroundColor="white"
        borderRadius="accordion"
        padding={6}>
        <FormSection name={selectedLocale}>
          <Field
            name={`${selectedLocale}-title`}
            id={`${selectedLocale}-title`}
            label={
              <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                {intl.formatMessage({ id: 'global.title' })}
              </Text>
            }
            component={component}
            disabled={false}
            type="text"
          />
        </FormSection>
        <UserListField
          clearable={false}
          autoload
          name="author"
          id="author"
          disabled={!isAdmin || !!organization}
          debounce
          aria-autocomplete="list"
          aria-haspopup="true"
          role="combobox"
          label={
            <Text fontSize={2} lineHeight="sm" fontWeight="normal">
              {intl.formatMessage({ id: 'global.author' })}
            </Text>
          }
          selectFieldIsObject
          multi
        />

        <FormSection name={selectedLocale}>
          <Field
            name={`${selectedLocale}-abstract`}
            id={`${selectedLocale}-abstract`}
            label={
              <Flex direction="row" spacing={1}>
                <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                  {intl.formatMessage({ id: 'admin.create.abstract.field' })}
                </Text>
                <Text fontSize={2} lineHeight="sm" fontWeight="normal" color="gray.500">
                  {intl.formatMessage({ id: 'global.optional' })}
                </Text>
              </Flex>
            }
            component={component}
            disabled={false}
            type="text"
          />
          <Field
            name={`${selectedLocale}-body`}
            id={`${selectedLocale}-body`}
            selectedLanguage={selectedLocale}
            label={
              <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                {intl.formatMessage({ id: 'admin.general.content' })}
              </Text>
            }
            component={component}
            disabled={false}
            fieldUsingJoditWysiwyg={bodyUsingJoditWysiwyg}
            fieldUsingJoditWysiwygName="bodyUsingJoditWysiwyg"
            formName={formName}
            type="admin-editor"
          />
        </FormSection>

        <Field
          name="media"
          label={
            <Flex direction="row">
              <Text fontSize={2} lineHeight="sm" fontWeight="normal" mr={1}>
                {intl.formatMessage({ id: 'cover-image' })}
              </Text>
              <Text fontSize={2} lineHeight="sm" fontWeight="normal" color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </Flex>
          }
          component={component}
          disabled={false}
          type="image"
        />
        {data.post ? (
          <ButtonGroup mt={6}>
            <Button
              variant="primary"
              variantColor="primary"
              variantSize="small"
              disabled={pristine || submitting}
              onClick={handleSubmit}>
              {intl.formatMessage({ id: 'global.save' })}
            </Button>
            <ModalPostDeleteConfirmation post={data.post} />
          </ButtonGroup>
        ) : (
          <ButtonGroup mt={6}>
            <Button
              variant="primary"
              variantColor="primary"
              variantSize="small"
              disabled={pristine || invalid || submitting}
              onClick={() => {
                dispatch(change(formName, 'is_published', true));
                setTimeout(() => {
                  dispatch(submit(formName));
                }, 500);
              }}>
              {intl.formatMessage({ id: 'admin.post.createAndPublish' })}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={pristine || invalid || submitting}
              variant="secondary"
              variantColor="primary"
              variantSize="small">
              {intl.formatMessage({ id: 'btn_create_and_edit_again' })}
            </Button>
          </ButtonGroup>
        )}
      </Flex>
      <Flex
        direction="column"
        width="27%"
        marginLeft={6}
        css={css({
          '.form-group': {
            marginBottom: 0,
          },
        })}>
        <Accordion
          spacing={2}
          defaultAccordion={!data.post ? 'volet-1' : ['volet-1', 'volet-2', 'volet-3', 'volet-4']}
          allowMultiple>
          <Item id="volet-1" pb={0}>
            <AccordionButton p={4}>
              <Text color="blue.800" fontSize={3} fontWeight="semibold">
                {intl.formatMessage({ id: 'admin.fields.blog_post.group_linked_content' })}
              </Text>
            </AccordionButton>
            <Panel
              pb={0}
              css={css({
                '.form-group': {
                  marginBottom: '24px',
                },
              })}>
              {renderLinkedContent()}
            </Panel>
          </Item>

          <Item id="volet-2" pb={0}>
            <AccordionButton p={4}>
              <Text color="blue.800" fontSize={3} fontWeight="semibold">
                {intl.formatMessage({ id: 'admin.fields.blog_post.group_meta' })}
              </Text>
            </AccordionButton>
            <Panel
              pb={6}
              css={css({
                '.form-group:first-child': {
                  marginBottom: '24px',
                },
                '.form-group:not(:first-child)': {
                  display: 'flex',
                  flexFlow: 'row-reverse',
                  justifyContent: 'flex-end',
                },
              })}>
              <Field
                name="published_at"
                label={
                  <Text fontSize={3} fontWeight="normal" color="gray.900">
                    {intl.formatMessage({ id: 'global.admin.published_at' })}
                  </Text>
                }
                component={component}
                disabled={false}
                type="datetime"
              />
              <Field id="is_published" name="is_published" component={component} type="checkbox">
                <Text fontSize={3} fontWeight="normal" color="gray.900">
                  {intl.formatMessage({ id: 'global.published' })}
                </Text>
              </Field>
              <Field id="has_comments" name="has_comments" component={component} type="checkbox">
                <Text fontSize={3} fontWeight="normal" color="gray.900">
                  {intl.formatMessage({ id: 'admin.post.comments_authorised' })}
                </Text>
              </Field>
            </Panel>
          </Item>

          {multiLangue ? (
            <Item id="volet-3" pb={0}>
              <AccordionButton p={4}>
                <Text color="blue.800" fontSize={3} fontWeight="semibold">
                  {intl.formatMessage({ id: 'capco.module.multilangue' })}
                </Text>
              </AccordionButton>
              <Panel pb={6}>
                <Field
                  name="languages"
                  label={
                    <Text fontSize={3} fontWeight="normal" color="gray.900">
                      {intl.formatMessage({ id: 'admin.post.languages' })}
                    </Text>
                  }
                  component={component}
                  disabled={false}
                  type="select"
                  onChange={e => {
                    setSelectedLocale(e.target.value);
                  }}>
                  {locales.filter(Boolean).map(locale => (
                    <option key={locale.id} value={locale.code}>
                      {intl.formatMessage({ id: locale.traductionKey })}
                    </option>
                  ))}
                </Field>
              </Panel>
            </Item>
          ) : null}

          <Item id="volet-4" pb={0}>
            <AccordionButton p={4}>
              <Text color="blue.800" fontSize={3} fontWeight="semibold">
                {intl.formatMessage({ id: 'admin.fields.blog_post.advanced' })}
              </Text>
            </AccordionButton>
            <Panel
              pb={6}
              css={css({
                '.form-group': {
                  marginBottom: '24px',
                },
              })}>
              <FormSection name={selectedLocale}>
                <Field
                  name={`${selectedLocale}-meta_description`}
                  id={`${selectedLocale}-meta_description`}
                  label={
                    <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                      {intl.formatMessage({ id: 'post.metadescription' })}
                    </Text>
                  }
                  component={component}
                  type="textarea"
                />
              </FormSection>
              <Field
                name="custom_code"
                placeholder={intl.formatMessage({ id: 'admin.customcode.placeholder' })}
                label={
                  <Text fontSize={2} lineHeight="sm" fontWeight="normal">
                    {intl.formatMessage({ id: 'admin.customcode' })}
                  </Text>
                }
                component={component}
                type="textarea"
              />
            </Panel>
          </Item>
        </Accordion>
      </Flex>
    </Flex>
  );
};
const validate = (values: FormValues) => {
  const errors = {};
  if (values.locales) {
    values.locales.map(locale => {
      if (!values[locale][`${locale}-title`] || values[locale][`${locale}-title`] === '') {
        errors[`${locale}`] = {
          [`${locale}-title`]: 'fill-field',
        };
      }
      if (!values[locale][`${locale}-body`] || values[locale][`${locale}-body`] === '') {
        errors[`${locale}`] = {
          [`${locale}-body`]: 'fill-field',
        };
      }
    });
  }

  if (!values.author || values.author.length === 0) {
    errors.author = 'fill-field';
  }
  if (!values.isAdmin && !values.isSuperAdmin && values.isProjectAdmin && !values.proposal) {
    if (!values.project || values.project.length === 0) {
      errors.project = 'fill-field';
    }
  }

  return errors;
};

const mapStateToProps = (state: GlobalState, { initialValues, query }: OwnProps) => {
  // $FlowFixMe $key type does not have the data - need to refacto PostFormPage before
  const organization = query?.viewer?.organizations?.[0];
  return {
    bodyUsingJoditWysiwyg: formValueSelector(formName)(state, 'bodyUsingJoditWysiwyg'),
    initialValues: {
      ...initialValues,
      author: organization?.id
        ? {
            value: organization?.id,
            label: organization?.displayName,
          }
        : initialValues.author,
    },
  };
};

const formContainer: React.AbstractComponent<AfterConnectProps> = reduxForm({
  form: formName,
  enableReinitialize: true,
  validate,
  onSubmit,
})(PostForm);

const postForm = (connect<AfterConnectProps, OwnProps, _, _, _, _>(mapStateToProps)(
  formContainer,
): React.AbstractComponent<OwnProps>);

export default postForm;
