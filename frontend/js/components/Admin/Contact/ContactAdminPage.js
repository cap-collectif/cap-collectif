// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import {
  QueryRenderer,
  graphql,
  createFragmentContainer,
  type RelayFragmentContainer,
} from 'react-relay';
import type { ContactAdminPage_query } from '~relay/ContactAdminPage_query.graphql';

import type { State, Dispatch } from '~/types';
import AlertForm from '../../Alert/AlertForm';
import ContactAdminList from './ContactAdminList';
import ContactAdminForm from './ContactAdminForm';
import CustomPageFields from '../Field/CustomPageFields';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import environment, { graphqlError } from '~/createRelayEnvironment';
import UpdateContactPageMutation from '~/mutations/UpdateContactPageMutation';
import type { FormValues as CustomFormValues } from '../Field/CustomPageFields';
import { getTranslation } from '~/services/Translation';
import type { ContactAdminPageQueryResponse } from '~relay/ContactAdminPageQuery.graphql';
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer';

type RelayProps = {|
  +query: ContactAdminPage_query,
|};

type StateProps = {|
  +dispatch: Dispatch,
  +currentLanguage: string,
  +initialValues: Object,
|};

type AfterConnectProps = {|
  ...RelayProps,
  ...StateProps,
|};

export type Props = {|
  ...ReduxFormFormProps,
  ...AfterConnectProps,
|};

const formName = 'contact-admin-form';

type FormValues = {|
  +title: string,
  +description: ?string,
  +custom: CustomFormValues,
|};

const validate = (values: FormValues) => {
  const errors = {};
  if (!values.title || values.title === '') {
    errors.title = 'fill-field';
  }

  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { title, description, custom } = values;
  const { customcode, picto, metadescription } = custom;

  const { currentLanguage } = props;

  const input = {
    title,
    description,
    customcode,
    picto: picto ? picto.id : null,
    metadescription,
    locale: currentLanguage,
  };
  return UpdateContactPageMutation.commit({ input });
};

const renderContactList = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?ContactAdminPageQueryResponse,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    return <ContactAdminList query={props} />;
  }
  return <Loader />;
};

export class ContactAdminPage extends React.Component<Props> {
  render(): React.Node {
    const {
      invalid,
      pristine,
      submitting,
      handleSubmit,
      error,
      valid,
      submitFailed,
      submitSucceeded,
    } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <h3 className="m-15">
              <FormattedMessage id="contact.title" />
            </h3>
          </div>
          <div className="col-md-6">
            <div align="right" className="m-15">
              <LanguageButtonContainer />
            </div>
          </div>
        </div>
        <div className="box box-primary container-fluid">
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="admin.group.content" />
            </h3>
          </div>
          <div className="box-content">
            <ContactAdminForm formName={formName} {...this.props} />
            <QueryRenderer
              environment={environment}
              query={graphql`
                query ContactAdminPageQuery {
                  ...ContactAdminList_query
                }
              `}
              variables={{}}
              render={renderContactList}
            />
          </div>
        </div>

        <div className="box box-primary container-fluid">
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="admin.fields.step.advanced" />
            </h3>
          </div>
          <CustomPageFields picto />
        </div>

        <div className="box no-border">
          <Button
            disabled={invalid || submitting || pristine}
            type="submit"
            bsStyle="primary"
            className="m-15">
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="global.save" />
            )}
          </Button>
        </div>
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
  }
}

const mapStateToProps = (state: State, { query }: RelayProps) => {
  const titleTranslation = getTranslation(
    query.title ? query.title.translations : [],
    state.language.currentLanguage,
  );

  const contentTranslation = getTranslation(
    query.content ? query.content.translations : [],
    state.language.currentLanguage,
  );

  return {
    currentLanguage: state.language.currentLanguage,
    initialValues: {
      title: titleTranslation ? titleTranslation.value : null,
      description: contentTranslation ? contentTranslation.value : null,
      custom: {
        metadescription: state.default.parameters['contact.metadescription'],
        picto: query.siteImage ? query.siteImage.media : '',
        customcode: state.default.parameters['contact.customcode'],
      },
    },
  };
};

const form = (reduxForm({
  onSubmit,
  validate,
  form: formName,
  enableReinitialize: true,
})(ContactAdminPage): React.AbstractComponent<AfterConnectProps>);

const container = (connect<AfterConnectProps, RelayProps, _, _, _, _>(mapStateToProps)(
  form,
): React.AbstractComponent<RelayProps>);

export default (createFragmentContainer(container, {
  query: graphql`
    fragment ContactAdminPage_query on Query {
      siteImage(keyname: "contact.picto") {
        id
        media {
          id
          name
          url
        }
      }
      title: siteParameter(keyname: "contact.title") {
        translations {
          value
          locale
        }
      }
      content: siteParameter(keyname: "contact.content.body") {
        translations {
          value
          locale
        }
      }
    }
  `,
}): RelayFragmentContainer<typeof container>);
