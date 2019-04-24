// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { Button } from 'react-bootstrap';
import type { FormProps } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';

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
};

const formName = 'contact-admin-form';

type FormValues = {
  title: string,
  description: ?string,
  customCode: ?CustomFormValues,
  picto: ?any,
  metadescription: ?any,
};

const validate = (values: FormValues) => {
  const errors = {};
  if (values.title === undefined || values.title.trim() === '') {
    errors.title = 'fill-field';
  }

  return errors;
};

const onSubmit = (values: FormValues) => {
  const { title, description, customCode, picto, metadescription } = values;
  const input = {
    title,
    description,
    customCode,
    picto,
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
            {/* TODO: Fix Flow here */}
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
          <CustomPageFields formName={formName} />
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

const mapStateToProps = (state: State) => ({
  initialValues: {
    title: state.default.parameters['contact.title'],
    description: state.default.parameters['contact.content.body'],
  },
});

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ContactAdminPage);

export default connect(mapStateToProps)(form);
