// @flow
import { Field } from 'redux-form';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { ListGroupItem, Button, ButtonToolbar, Badge } from 'react-bootstrap';

import config from '~/config';
import Toggle from '~/components/Form/Toggle';
import AppDispatcher from '~/dispatchers/AppDispatcher';
import DeleteModal from '~/components/Modal/DeleteModal';
import type { LocaleAdminListItem_locale } from '~relay/LocaleAdminListItem_locale.graphql';
import UpdateLocaleStatusMutation from '~/mutations/UpdateLocaleStatusMutation';

type Props = {|
  locale: LocaleAdminListItem_locale,
|};

const ContainerTitle: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
`;

const ContainerDefault: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  height: 15px;
  padding-top: 2px;
`;

const ContainerToggle: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .form-group {
    margin-bottom: 0;
  }
`;

const onDelete = (locale: LocaleAdminListItem_locale) => {
  UpdateLocaleStatusMutation.commit({
    input: {
      locales: [
        {
          id: locale.id,
          isEnabled: false,
          isPublished: false,
        },
      ],
    },
  }).then(() =>
    AppDispatcher.dispatch({
      actionType: 'UPDATE_ALERT',
      alert: {
        bsStyle: 'success',
        content: 'the-language-has-been-removed',
      },
    }),
  );
};

export const LocaleAdminListItem = ({ locale }: Props) => {
  const [showModal, displayModal] = useState(false);
  const intl = useIntl();

  return (
    <ListGroupItem style={{ backgroundColor: '#FAFAFA' }}>
      <ContainerTitle>
        <ContainerToggle>
          <Field
            labelSide="LEFT"
            component={Toggle}
            label={intl.formatMessage({ id: locale.traductionKey })}
            name={`locales.${locale.id}.isPublished`}
            normalize={val => !!val}
            id={locale.id}
            disabled={locale.isDefault}
          />
        </ContainerToggle>
        {locale.isDefault && (
          <ContainerDefault>
            <Badge
              pill="true"
              variant="info"
              style={{ backgroundColor: '#1D8393' }}
              className="ml-15">
              <FormattedMessage id="by-default" />
            </Badge>
          </ContainerDefault>
        )}
      </ContainerTitle>
      {!locale.isDefault && (
        <ButtonToolbar>
          <Button
            id={`DeleteContact-${locale.id}`}
            className="mt-5 btn-outline-danger btn-danger"
            onClick={() => displayModal(true)}>
            <i className="fa fa-trash" />
            {!config.isMobile && (
              <span className="ml-5">
                <FormattedMessage id="global.delete" />
              </span>
            )}
          </Button>
        </ButtonToolbar>
      )}
      <DeleteModal
        showDeleteModal={showModal}
        closeDeleteModal={() => displayModal(false)}
        deleteElement={() => onDelete(locale)}
        deleteModalTitle="are-you-sure-you-want-to-delete-this-language"
        deleteModalContent="translation-help-text"
      />
    </ListGroupItem>
  );
};

export default createFragmentContainer(LocaleAdminListItem, {
  locale: graphql`
    fragment LocaleAdminListItem_locale on Locale {
      id
      traductionKey
      code
      isEnabled
      isPublished
      isDefault
    }
  `,
});
