// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { Button } from 'react-bootstrap';
import type { FormProps } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { type ReadyState, QueryRenderer, graphql, createFragmentContainer } from 'react-relay';
import type { ContactAdminPage_query } from '~relay/ContactAdminPage_query.graphql';

import type { State } from '../../../types';
import ContactAdminList from './ContactAdminList';
import ContactAdminForm from './ContactAdminForm';
import CustomPageFields from '../Field/CustomPageFields';
import type { FormValues as CustomFormValues } from '../Field/CustomPageFields';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import UpdateContactPageMutation from '../../../mutations/UpdateContactPageMutation';

type Props = {
  ...FormProps,
  query: ContactAdminPage_query,
};

const formName = 'contact-admin-form';

type FormValues = {
  title: string,
  description: ?string,
  custom: CustomFormValues,
};

const validate = (values: FormValues) => {
  const errors = {};
  if (values.title === undefined) {
    errors.title = 'fill-field';
  }

  return errors;
};

const onSubmit = (values: FormValues) => {
  const { title, description, custom } = values;
  const { customcode, picto, metadescription } = custom;
  const input = {
    title,
    description,
    customcode,
    picto: picto ? picto.id : null,
    metadescription,
  };
  return UpdateContactPageMutation.commit({ input });
};

const renderContactList = ({
  error,
  props,
}: {
  props: any,
} & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    // $FlowFixMe
    return <ContactAdminList query={props} />;
  }
  return <Loader />;
};

export class ContactAdminPage extends React.Component<Props> {
  render() {
    const { invalid, pristine, submitting, handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <div className="box box-primary container-fluid">
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="admin.group.content" />
            </h3>
          </div>
          <div className="box-content">
            {/* $FlowFixMe */}
            <ContactAdminForm {...this.props} formName={formName} />
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
              <FormattedMessage id="admin.fields.project.advanced" />
            </h3>
          </div>
          <CustomPageFields formName={formName} {...this.props} />
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
      </form>
    );
  }
}

const mapStateToProps = (state: State, props: any) => ({
  initialValues: {
    title: state.default.parameters['contact.title'],
    description: state.default.parameters['contact.content.body'],
    custom: {
      metadescription: state.default.parameters['contact.metadescription'],
      picto: props.query.siteImage.media,
      customcode: state.default.parameters['contact.customcode'],
    },
  },
});

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ContactAdminPage);

export default createFragmentContainer(connect(mapStateToProps)(form), {
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
    }
  `,
});
