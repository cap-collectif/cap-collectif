// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm, type FormProps } from 'redux-form';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import component from '../../Form/Field';
import type { GlobalState, MediaFromAPI } from '../../../types';
import { type SiteFaviconAdminForm_siteFavicon } from './__generated__/SiteFaviconAdminForm_siteFavicon.graphql';
import ChangeSiteFaviconMutation from '../../../mutations/ChangeSiteFaviconMutation';
import AlertForm from '../../Alert/AlertForm';
import RemoveSiteFaviconMutation from '../../../mutations/RemoveSiteFaviconMutation';

type FormValues = {|
  +media: ?MediaFromAPI,
|};

type RelayProps = {|
  +siteFavicon: SiteFaviconAdminForm_siteFavicon,
|};

type Props = {|
  ...RelayProps,
  ...FormProps,
|};

const formName = 'site-favicon-admin';

const onSubmit = async (values: FormValues) => {
  const { media } = values;

  if (media) {
    const mediaId = media.id;
    const input = {
      mediaId,
    };

    return ChangeSiteFaviconMutation.commit({ input });
  }

  return RemoveSiteFaviconMutation.commit({ input: {} });
};

const SiteFaviconAdminForm = (props: Props) => {
  const {
    siteFavicon,
    handleSubmit,
    pristine,
    invalid,
    valid,
    submitSucceeded,
    submitFailed,
    submitting,
  } = props;
  document.querySelectorAll('link[rel="icon"]').forEach((node: HTMLElement) => {
    if (node instanceof HTMLLinkElement) { // eslint-disable-line no-undef
      node.href = siteFavicon && siteFavicon.media ? siteFavicon.media.url : '/favicon-96x96.png';
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Field
        id="proposal_media"
        name="media"
        component={component}
        type="image"
        label={
          <span>
            <FormattedMessage id="admin.fields.theme.media" />
          </span>
        }
        help={<FormattedMessage id="favicon-parameters" />}
      />
      <Button
        type="submit"
        id="site_favicon_save"
        bsStyle="primary"
        disabled={pristine || invalid || submitting}>
        <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
      </Button>
      <AlertForm
        valid={valid}
        invalid={invalid}
        submitting={submitting}
        submitSucceeded={submitSucceeded}
        submitFailed={submitFailed}
      />
    </form>
  );
};

const mapStateToProps = (state: GlobalState, { siteFavicon }: Props) => ({
  initialValues: {
    media: siteFavicon.media,
  },
});

const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(SiteFaviconAdminForm);

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment SiteFaviconAdminForm_siteFavicon on SiteImage {
      id
      media {
        id
        url
        name
      }
    }
  `,
);
