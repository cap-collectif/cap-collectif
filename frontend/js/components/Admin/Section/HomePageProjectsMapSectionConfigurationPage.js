// @flow
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import type { IntlShape } from 'react-intl';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import * as S from './HomePageProjectsSectionConfigurationPage.style';
import renderComponent from '~/components/Form/Field';
import type { Dispatch, GlobalState } from '~/types';
import Button from '~ds/Button/Button';
import UpdateHomePageProjectsMapSectionConfigurationMutation from '~/mutations/UpdateHomePageProjectsMapSectionConfigurationMutation';
import Flex from '~ui/Primitives/Layout/Flex';
import { toast } from '~ds/Toast';
import { handleTranslationChange, formatLocaleToCode } from '~/services/Translation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import Text from '~ui/Primitives/Text';
import type { HomePageProjectsMapSectionConfigurationPage_homePageProjectsMapSectionConfiguration } from '~relay/HomePageProjectsMapSectionConfigurationPage_homePageProjectsMapSectionConfiguration.graphql';
import InfoMessage from '~ds/InfoMessage/InfoMessage';

const formName = 'section-proposal-admin-form';

type Props = {|
  +homePageProjectsMapSectionConfiguration: HomePageProjectsMapSectionConfigurationPage_homePageProjectsMapSectionConfiguration,
  +hasDistrict: boolean,
  +currentLanguage: string,
  +intl: IntlShape,
  ...ReduxFormFormProps,
|};

type FormValues = {|
  +enabled: string,
  +position: string,
  +teaser: ?string,
  +title: string,
|};

const TEASER_MAX = 200;

const asyncValidate = (values: FormValues) => {
  return new Promise((resolve, reject) => {
    if (values?.teaser && values.teaser.length > TEASER_MAX) {
      const error = {};
      error.teaser = { id: 'characters-maximum', values: { quantity: TEASER_MAX } };
      return reject(error);
    }
    if (values.title.trim() === '') {
      const error = {
        title: { id: 'error.fill.title' },
      };
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
  const { title, teaser, position } = values;

  const translationsData = handleTranslationChange(
    [],
    {
      locale: formatLocaleToCode(currentLanguage),
      title,
      teaser,
    },
    currentLanguage,
  );

  const input = {
    position: parseInt(position, 10),
    enabled: values.enabled === 'published',
    translations: translationsData,
  };

  try {
    const { updateHomePageProjectsMapSectionConfiguration } =
      await UpdateHomePageProjectsMapSectionConfigurationMutation.commit({
        input,
      });
    const errorCode = updateHomePageProjectsMapSectionConfiguration?.errorCode;
    if (errorCode === 'INVALID_FORM') {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
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

export const HomePageProjectsMapSectionConfigurationPage = ({
  handleSubmit,
  intl,
  submitting,
  hasDistrict,
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
            placeholder="find-projects-next-to-you"
            label={
              <Flex>
                <Text>{intl.formatMessage({ id: 'admin.fields.project.teaser' })}</Text>
                <Text ml={2} color="gray.500">
                  {intl.formatMessage({ id: 'global.optional' })}
                </Text>
              </Flex>
            }
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
        {!hasDistrict && (
          <InfoMessage variant="info" width="fit-content">
            <InfoMessage.Title>Information</InfoMessage.Title>
            <InfoMessage.Content>
              <FormattedHTMLMessage
                id="create-district-link"
                values={{ url: '/admin-next/geographicalAreas' }}
              />
            </InfoMessage.Content>
          </InfoMessage>
        )}
      </S.SectionContainer>

      <Button variant="primary" variantSize="big" type="submit" isLoading={submitting}>
        {intl.formatMessage({ id: 'global.save' })}
      </Button>
    </form>
  );
};

const mapStateToProps = (
  state: GlobalState,
  { homePageProjectsMapSectionConfiguration }: Props,
) => {
  if (homePageProjectsMapSectionConfiguration) {
    const { title, teaser, position, enabled } = homePageProjectsMapSectionConfiguration;

    const initialValues = {
      title,
      teaser,
      position,
      enabled: enabled === true ? 'published' : 'unpublished',
    };
    return {
      initialValues,
      displayMode: formValueSelector(formName)(state, 'displayMode'),
      currentLanguage: state.language.currentLanguage,
    };
  }
};

const form = injectIntl(
  reduxForm({
    form: formName,
    onSubmit,
    asyncValidate,
    asyncChangeFields: ['teaser', 'title'],
  })(HomePageProjectsMapSectionConfigurationPage),
);

const HomePageProjectsMapSectionConfigurationPageConnected = connect<any, any, _, _, _, _>(
  mapStateToProps,
)(form);

const fragmentContainer = createFragmentContainer(
  HomePageProjectsMapSectionConfigurationPageConnected,
  {
    homePageProjectsMapSectionConfiguration: graphql`
      fragment HomePageProjectsMapSectionConfigurationPage_homePageProjectsMapSectionConfiguration on HomePageProjectsMapSectionConfiguration {
        title
        position
        teaser
        enabled
      }
    `,
  },
);

export default fragmentContainer;
