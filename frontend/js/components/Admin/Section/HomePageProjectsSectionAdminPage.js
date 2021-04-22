// @flow
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import type { IntlShape } from 'react-intl';
import { injectIntl } from 'react-intl';
import * as S from './HomePageProjectsSectionAdminPage.style';
import renderComponent from '~/components/Form/Field';
import type { Dispatch, GlobalState } from '~/types';
import Button from '~ds/Button/Button';
import UpdateHomePageProjectsSectionAdminMutation from '~/mutations/UpdateHomePageProjectsSectionAdminMutation';
import type { HomePageProjectsSectionAdminPageDisplayMostRecent_query$key } from '~relay/HomePageProjectsSectionAdminPageDisplayMostRecent_query.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Icon from '~ds/Icon/Icon';
import { toast } from '~ds/Toast';
import type {
  HomePageProjectsSectionAdminDisplayMode,
  HomePageProjectsSectionAdminPage_homePageProjectsSectionAdmin,
} from '~relay/HomePageProjectsSectionAdminPage_homePageProjectsSectionAdmin.graphql';
import HomePageProjectsSectionAdminPageDisplayMostRecent from '~/components/Admin/Section/HomePageProjectsSectionAdminPageDisplayMostRecent';
import { handleTranslationChange } from '~/services/Translation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import Text from '~ui/Primitives/Text';
import HomePageProjectsSectionAdminPageDisplayCustom from '~/components/Admin/Section/HomePageProjectsSectionAdminPageDisplayCustom';
import type { HomePageProjectsSectionAdminPageDisplayCustom_query$key } from '~relay/HomePageProjectsSectionAdminPageDisplayCustom_query.graphql';
import type { HomePageProjectsSectionAdminPageDisplayCustom_homePageProjectsSectionAdmin$key } from '~relay/HomePageProjectsSectionAdminPageDisplayCustom_homePageProjectsSectionAdmin.graphql';

const formName = 'section-proposal-admin-form';

type Props = {|
  +displayMode: HomePageProjectsSectionAdminDisplayMode,
  +homePageProjectsSectionAdmin: HomePageProjectsSectionAdminPage_homePageProjectsSectionAdmin,
  +currentLanguage: string,
  +maxProjectsDisplay: number,
  +intl: IntlShape,
  +paginatedProjectsFragmentRef: HomePageProjectsSectionAdminPageDisplayMostRecent_query$key,
  +allProjectsFragmentRef: HomePageProjectsSectionAdminPageDisplayCustom_query$key,
  +homePageProjectsSectionAdminFragmentRef: HomePageProjectsSectionAdminPageDisplayCustom_homePageProjectsSectionAdmin$key,
  ...ReduxFormFormProps,
|};

type FormValues = {|
  +displayMode: HomePageProjectsSectionAdminDisplayMode,
  +enabled: string,
  +nbObjects: string,
  +position: string,
  +teaser: string,
  +title: string,
  +projects: $ReadOnlyArray<string>,
|};

const TEASER_MAX = 200;

const asyncValidate = (values: FormValues, dispatch: Dispatch, { maxProjectsDisplay }: Props) => {
  return new Promise((resolve, reject) => {
    if (parseInt(values.nbObjects, 10) > maxProjectsDisplay) {
      const error = {};
      error.nbObjects = { id: 'n-maximum', values: { n: maxProjectsDisplay } };
      return reject(error);
    }
    if (values.teaser.length > TEASER_MAX) {
      const error = {};
      error.teaser = { id: 'characters-maximum', values: { quantité: TEASER_MAX } };
      return reject(error);
    }
    return resolve();
  });
};

const onSubmit = async (
  values: FormValues,
  dispatch: Dispatch,
  { currentLanguage, intl }: Props,
) => {
  const { title, teaser, position, nbObjects, projects } = values;

  const translationsData = handleTranslationChange(
    [],
    {
      locale: currentLanguage,
      title,
      teaser,
    },
    currentLanguage,
  );

  const input = {
    position: parseInt(position, 10),
    displayMode: values.displayMode,
    nbObjects: parseInt(nbObjects, 10),
    enabled: values.enabled === 'published',
    translations: translationsData,
    projects,
  };

  try {
    const {
      updateHomePageProjectsSectionAdmin,
    } = await UpdateHomePageProjectsSectionAdminMutation.commit({
      input,
    });
    const errorCode = updateHomePageProjectsSectionAdmin?.errorCode;
    if (errorCode === 'TOO_MANY_PROJECTS') {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({ id: 'section.admin.form.error.projects.number' }),
      });
      return;
    }
    toast({
      variant: 'success',
      content: intl.formatHTMLMessage({ id: 'all.data.saved' }),
    });
  } catch (e) {
    mutationErrorToast(intl);
  }
};

export const HomePageProjectsSectionAdminPage = ({
  handleSubmit,
  homePageProjectsSectionAdmin,
  displayMode,
  maxProjectsDisplay,
  intl,
  paginatedProjectsFragmentRef,
  allProjectsFragmentRef,
  homePageProjectsSectionAdminFragmentRef,
  submitting,
}: Props) => {
  return (
    <form method="POST" onSubmit={handleSubmit}>
      <S.SectionContainer>
        <h1>{intl.formatMessage({ id: 'global.general' })}</h1>
        <S.SectionInner>
          <Field
            type="text"
            name="title"
            id="title"
            placeholder="global.participative.project"
            label={intl.formatMessage({ id: 'global.title' })}
            component={renderComponent}
          />
          <Field
            type="textarea"
            name="teaser"
            id="teaser"
            placeholder="section-admin-teaser-placeholder"
            label={intl.formatMessage({ id: 'admin.fields.project.teaser' })}
            component={renderComponent}
          />
          <Field
            type="number"
            name="position"
            id="position"
            label={intl.formatMessage({ id: 'section-admin-display-order' })}
            component={renderComponent}
            min={0}
          />
        </S.SectionInner>
      </S.SectionContainer>

      <S.SectionContainer>
        <Flex direction="row" justify="space-between" alignItems="center">
          <h1>{intl.formatMessage({ id: 'section-admin-display-settings' })}</h1>
          <S.PreviewLink direction="row" alignItems="center" mb={24}>
            <Icon color="inherit" name="PREVIEW" size="md" />
            <a href="/" target="_blank">
              {intl.formatMessage({ id: 'global.preview' })}
            </a>
          </S.PreviewLink>
        </Flex>

        <S.SectionInner>
          <div>
            <Text mb={4}>{intl.formatMessage({ id: 'section-admin-projects-selection' })}</Text>
            <Field
              type="radio"
              name="displayMode"
              id="section-display-mode-most-recent"
              component={renderComponent}
              value="MOST_RECENT">
              <span>{intl.formatMessage({ id: 'section-admin-most-recents' })}</span>
            </Field>

            <Field
              type="radio"
              name="displayMode"
              id="section-display-mode-custom"
              component={renderComponent}
              value="CUSTOM">
              <span>{intl.formatMessage({ id: 'global.custom.feminine.lowercase' })}</span>
            </Field>
          </div>

          {displayMode === 'MOST_RECENT' && (
            <HomePageProjectsSectionAdminPageDisplayMostRecent
              paginatedProjectsFragmentRef={paginatedProjectsFragmentRef}
              homePageProjectsSectionAdmin={homePageProjectsSectionAdmin}
              maxProjectsDisplay={maxProjectsDisplay}
            />
          )}

          {displayMode === 'CUSTOM' && (
            <HomePageProjectsSectionAdminPageDisplayCustom
              allProjectsFragmentRef={allProjectsFragmentRef}
              homePageProjectsSectionAdminFragmentRef={homePageProjectsSectionAdminFragmentRef}
              maxProjectsDisplay={maxProjectsDisplay}
              formName={formName}
            />
          )}
        </S.SectionInner>
      </S.SectionContainer>

      <S.SectionContainer>
        <h1>{intl.formatMessage({ id: 'global.publication' })}</h1>

        <div>
          <Field
            type="radio"
            name="enabled"
            id="section-is-not-published"
            component={renderComponent}
            value="unpublished">
            <span>{intl.formatMessage({ id: 'post_is_not_public' })}</span>
          </Field>

          <Field
            type="radio"
            name="enabled"
            id="section-is-published"
            component={renderComponent}
            value="published">
            <span>{intl.formatMessage({ id: 'admin.fields.section.enabled' })}</span>
          </Field>
        </div>
      </S.SectionContainer>

      <Button variant="primary" variantSize="big" type="submit" isLoading={submitting}>
        {intl.formatMessage({ id: 'global.save' })}
      </Button>
    </form>
  );
};

const mapStateToProps = (state: GlobalState, { homePageProjectsSectionAdmin }: Props) => {
  if (homePageProjectsSectionAdmin) {
    const {
      title,
      teaser,
      position,
      displayMode,
      nbObjects,
      enabled,
      projects,
    } = homePageProjectsSectionAdmin;

    const initialValues = {
      title,
      teaser,
      position,
      displayMode,
      nbObjects,
      enabled: enabled === true ? 'published' : 'unpublished',
      projects: projects?.edges?.map(edge => edge?.node?.id),
    };
    return {
      initialValues,
      displayMode: formValueSelector(formName)(state, 'displayMode'),
      currentLanguage: state.language.currentLanguage,
      maxProjectsDisplay: state.default.features.unstable__new_project_card === true ? 9 : 8,
    };
  }
};

const form = injectIntl(
  reduxForm({
    form: formName,
    onSubmit,
    asyncValidate,
    asyncChangeFields: ['nbObjects', 'teaser'],
  })(HomePageProjectsSectionAdminPage),
);

const HomePageProjectsSectionAdminPageConnected = connect<any, any, _, _, _, _>(mapStateToProps)(
  form,
);

const fragmentContainer = createFragmentContainer(HomePageProjectsSectionAdminPageConnected, {
  homePageProjectsSectionAdmin: graphql`
    fragment HomePageProjectsSectionAdminPage_homePageProjectsSectionAdmin on HomePageProjectsSectionAdmin {
      id
      title
      position
      teaser
      displayMode
      enabled
      nbObjects
      projects {
        edges {
          node {
            id
          }
        }
      }
    }
  `,
});

export default fragmentContainer;
