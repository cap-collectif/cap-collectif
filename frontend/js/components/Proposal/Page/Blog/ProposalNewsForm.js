// @flow
import * as React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import component from '~/components/Form/Field';
import stripHtml from '~/utils/stripHtml';
import type { ProposalNewsForm_post } from '~relay/ProposalNewsForm_post.graphql';
import type { GlobalState } from '~/types';
import { getTranslation } from '~/services/Translation';
import { TranslationLocaleEnum } from '~/utils/enums/TranslationLocale';

export type FormValues = {|
  title: ?string,
  abstract: ?string,
  body: ?string,
  media: ?{ id: string },
|};

type RelayProps = {| post: ?ProposalNewsForm_post |};
type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  +initialValues: FormValues,
|};

const customForm: StyledComponent<{}, {}, HTMLFormElement> = styled.form`
  label {
    font-weight: 400;
  }
`;

export const formName = `ProposalNewsForm`;

const validate = ({ title, body }: FormValues) => {
  const errors = {};

  if (!title || title.length < 2) {
    errors.title = 'global.required';
  }

  if (!body || !stripHtml(body)) {
    errors.body = 'global.required';
  }

  return errors;
};

export const ProposalNewsForm = ({ handleSubmit }: Props) => {
  return (
    <customForm id={`${formName}`} onSubmit={handleSubmit}>
      <Field
        name="title"
        component={component}
        type="text"
        required
        id="proposal_news_title"
        label={<FormattedMessage id="global.title" />}
      />
      <Field
        name="abstract"
        component={component}
        type="text"
        id="proposal_news_abstract"
        label={
          <span>
            <FormattedMessage id="proposal.summary" />
            <span className="excerpt">
              <FormattedMessage id="global.optional" />
            </span>
          </span>
        }
      />
      <Field
        name="body"
        component={component}
        type="editor-ds"
        id="proposal_news_body"
        label={<FormattedMessage id="proposal-news-body-field" />}
      />
      <Field
        id="proposal_news_media"
        name="media"
        component={component}
        type="image"
        label={<FormattedMessage id="cover-image" />}
      />
    </customForm>
  );
};

const formContainer = reduxForm({
  form: formName,
  validate,
  enableReinitialize: true,
})(ProposalNewsForm);

const mapStateToProps = (state: GlobalState, { post }: Props) => {
  if (!post) {
    return {
      currentLanguage: state.language.currentLanguage,
      initialValues: {
        title: null,
        body: null,
        abstract: null,
        media: null,
      },
    };
  }
  const translation = getTranslation(
    post && post.translations ? post.translations : [],
    TranslationLocaleEnum[state.language.currentLanguage],
  );

  return {
    currentLanguage: state.language.currentLanguage,
    initialValues: {
      title: translation ? translation.title : null,
      body: translation ? translation.body : null,
      abstract: translation ? translation.abstract : null,
      media: post ? post.media : null,
    },
  };
};

export const ProposalNewsFormCreate = connect<any, any, _, _, _, _>(mapStateToProps)(formContainer);

export default createFragmentContainer(ProposalNewsFormCreate, {
  post: graphql`
    fragment ProposalNewsForm_post on Post {
      id
      translations {
        title
        body
        abstract
        locale
      }
      media {
        url
        id
      }
    }
  `,
});
