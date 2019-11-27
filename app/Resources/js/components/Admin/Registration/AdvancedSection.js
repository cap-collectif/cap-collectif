// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import component from '../../Form/Field';
import UpdateRegistrationPageMutation from '../../../mutations/UpdateRegistrationPageMutation';
import type { State } from '../../../types';
import type { AdvancedSection_query } from '~relay/AdvancedSection_query.graphql';

export type FormValues = {|
  customcode?: string,
|};

export type Props = {|
  ...ReduxFormFormProps,
  query: AdvancedSection_query,
|};

const onSubmit = (values: FormValues) => {
  const { customcode } = values;
  // eslint-disable-next-line no-undef
  const parser = new DOMParser();
  const input = {
    customcode,
  };
  if (customcode === undefined || customcode === null) {
    return UpdateRegistrationPageMutation.commit({ input });
  }
  const nodes = parser.parseFromString(customcode, 'text/html');
  const scriptNode = nodes.getElementsByTagName('script')[0];

  try {
    if (scriptNode && scriptNode.innerText && scriptNode.innerText.length > 0) {
      // eslint-disable-next-line no-eval
      eval(scriptNode.innerText);
    }
  } catch (e) {
    throw new SubmissionError({
      customcode: `Error: ${e}`,
    });
  }
  return UpdateRegistrationPageMutation.commit({ input });
};

const validate = () => {
  return {};
};

const formName = 'registration-custom-script';

class AdvancedSection extends React.Component<Props> {
  render() {
    const { submitting, handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <div className="box box-primary container-fluid">
          <div className="box-content box-content__content-form">
            <h3 className="box-title">
              <FormattedMessage id='admin.fields.project.advanced' />
            </h3>

            <Field
              name="customcode"
              type="textarea"
              label={<FormattedMessage id="registration.script.done" />}
              help={<FormattedMessage id="registration.script.hint" />}
              component={component}
              placeholder='<script type="text/javascript"> </script>"'
            />

            <div className="box no-border">
              <Button type="submit" bsStyle="primary" className="m-15">
                {submitting ? (
                  <FormattedMessage id="global.loading" />
                ) : (
                  <FormattedMessage id="global.save" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(AdvancedSection);

const mapStateToProps = (state: State, props: Props) => ({
  initialValues: {
    customcode: props.query.registrationScript,
  },
});

export default createFragmentContainer(connect(mapStateToProps)(form), {
  query: graphql`
    fragment AdvancedSection_query on Query {
      registrationScript
    }
  `,
});
