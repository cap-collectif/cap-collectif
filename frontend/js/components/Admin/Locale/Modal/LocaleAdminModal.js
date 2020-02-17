// @flow
import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { reduxForm, SubmissionError, submit } from 'redux-form';

import type { GlobalState } from '~/types';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import LocaleAdminModalList from './LocaleAdminModalList';
import type { LocaleAdminModal_locales } from '~relay/LocaleAdminModal_locales.graphql';
import UpdateLocaleStatusMutation from '~/mutations/UpdateLocaleStatusMutation';

type Props = {|
  ...ReduxFormFormProps,
  locales: LocaleAdminModal_locales,
  show: boolean,
  displayModal: (show: boolean) => void,
  dispatch: Dispatch,
|};

type FormValues = {|
  [string]: { id: string, isEnabled: boolean },
|};

export const formName = `local-admin-modal`;

const validate = () => {
  const errors = {};
  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, { displayModal }: Props) => {
  return UpdateLocaleStatusMutation.commit({
    // $FlowFixMe generated relay type vs custom one, don't have time to retype everything
    input: { locales: { ...values } },
  })
    .then(() => {
      displayModal(false);
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

export const LocaleAdminModal = ({
  locales,
  displayModal,
  show,
  dispatch,
  pristine,
  invalid,
  submitting,
}: Props) => {
  if (locales) {
    return (
      <Modal
        show={show}
        onHide={() => displayModal(false)}
        animation={false}
        dialogClassName="modal--update">
        <form id={`${formName}`} onSubmit={onSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="font-weight-bold">
              <Icon name={ICON_NAME.networkAdd} size={32} />{' '}
              <FormattedMessage id="add-a-language" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <LocaleAdminModalList locales={locales} />
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" onClick={() => displayModal(false)}>
              <span className="font-weight-bold">
                <FormattedMessage id="global.cancel" />
              </span>
            </Button>
            <Button
              type="button"
              id={`${formName}_submit`}
              bsStyle="primary"
              disabled={pristine || invalid || submitting}
              onClick={() => {
                dispatch(submit(formName));
              }}>
              <span className="font-weight-bold">
                <FormattedMessage id={submitting ? 'global.loading' : 'global.add'} />
              </span>
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

  return null;
};

const getInitialValue = ({ locales }: Props): FormValues => {
  const value = {};
  locales.map(locale => {
    value[locale.id] = {
      id: locale.id,
      isEnabled: locale.isEnabled,
    };
  });

  // $FlowFixMe https://github.com/facebook/flow/issues/2977
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
  })(LocaleAdminModal),
);

export default createFragmentContainer(form, {
  locales: graphql`
    fragment LocaleAdminModal_locales on Locale @relay(plural: true) {
      id
      isEnabled
      ...LocaleAdminModalList_locales
    }
  `,
});
