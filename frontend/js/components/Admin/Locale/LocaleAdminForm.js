// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { reduxForm, SubmissionError } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';

import type { GlobalState } from '~/types';
import LocaleAdminSelect, { type Locales } from './LocaleAdminSelect';
import AlertForm from '~/components/Alert/AlertForm';
import LocaleAdminList from './List/LocaleAdminList';
import UpdateLocaleStatusMutation from '~/mutations/UpdateLocaleStatusMutation';
import SetDefaultLocaleMutation from '~/mutations/SetDefaultLocaleMutation';
import type { LocaleAdminForm_query } from '~relay/LocaleAdminForm_query.graphql';

type Props = {|
  ...ReduxFormFormProps,
  query: LocaleAdminForm_query,
|};

type FormValues = {
  locales: Locales,
  defaultLocale: ?string,
};

export const formName = `local-admin`;

const validate = ({ locales, defaultLocale }: FormValues) => {
  const errors = {};

  if (defaultLocale && locales[defaultLocale] && !locales[defaultLocale].isPublished) {
    errors.defaultLocale = 'defaultLocale.error.notPublished';
  }

  return errors;
};

const onSubmit = (values: FormValues) => {
  if (values.defaultLocale) {
    return SetDefaultLocaleMutation.commit({
      input: {
        id: values.defaultLocale,
      },
    })
      .catch(() => {
        throw new SubmissionError({
          _error: 'global.error.server.form',
        });
      })
      .then(() => {
        delete values.defaultLocale;
        return UpdateLocaleStatusMutation.commit({
          // $FlowFixMe we can't know the exact format of values...
          input: { locales: { ...values.locales } },
        }).catch(() => {
          throw new SubmissionError({
            _error: 'global.error.server.form',
          });
        });
      });
  }

  delete values.defaultLocale;

  return UpdateLocaleStatusMutation.commit({
    // $FlowFixMe we can't know the exact format of values...
    input: { locales: { ...values.locales } },
  }).catch(() => {
    throw new SubmissionError({
      _error: 'global.error.server.form',
    });
  });
};

export const LocaleAdminForm = ({
  query,
  valid,
  error,
  invalid,
  pristine,
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
}: Props) => (
  <form onSubmit={handleSubmit} id={`${formName}`}>
    <LocaleAdminList locales={query.availableLocales} />
    <LocaleAdminSelect locales={query.availableLocales} formName={formName} />
    <Button
      type="submit"
      id={`${formName}_submit`}
      bsStyle="primary"
      disabled={pristine || invalid || submitting}>
      <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
    </Button>
    <AlertForm
      valid={valid}
      invalid={false}
      submitting={submitting}
      submitSucceeded={submitSucceeded}
      submitFailed={submitFailed}
      errorMessage={error}
    />
  </form>
);

const getInitialValue = ({ query }: Props): FormValues => {
  const defaultLocale = query.availableLocales.find(locale => locale.isDefault);
  const value = {
    locales: {},
    defaultLocale: defaultLocale ? defaultLocale.id : null,
  };

  query.availableLocales.map(locale => {
    value.locales[locale.id] = {
      id: locale.id,
      isEnabled: locale.isEnabled,
      isPublished: locale.isPublished,
    };
  });

  return value;
};

const mapStateToProps = (state: GlobalState, props: Props) => ({
  form: formName,
  initialValues: getInitialValue(props),
});

const form = connect(mapStateToProps)(
  reduxForm({
    validate,
    onSubmit,
    enableReinitialize: true,
  })(LocaleAdminForm),
);

export default createFragmentContainer(form, {
  query: graphql`
    fragment LocaleAdminForm_query on Query {
      availableLocales(includeDisabled: true) {
        id
        isEnabled
        isPublished
        isDefault
        ...LocaleAdminSelect_locales
        ...LocaleAdminList_locales
      }
    }
  `,
});
