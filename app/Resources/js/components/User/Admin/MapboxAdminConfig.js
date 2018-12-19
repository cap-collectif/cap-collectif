// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, ListGroup } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import { Field, type FormProps, reduxForm, SubmissionError } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import styled from 'styled-components';
import type { MapboxAdminConfig_mapToken } from './__generated__/MapAdminPageQuery.graphql';
import ChangeMapProviderTokenMutation from '../../../mutations/ChangeMapProviderTokenMutation';
import type { GlobalState } from '../../../types';
import component from '../../Form/Field';
import MapAdminStyleListItem from './MapAdminStyleListItem';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

type FormValues = {
  +publicToken: string,
  +secretToken: ?string,
};

type Props = FormProps & {
  mapToken: MapboxAdminConfig_mapToken,
};

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  h3 {
    display: inline-block;
    margin: 0 0 0 0.5rem;
  }
`;

const SubmitButtonInner = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const formName = 'mapbox-admin-config';

const validate = (values: FormValues) => {
  const errors = {};
  const fields = ['publicToken'];

  fields.forEach(field => {
    if (
      (field === 'publicToken' && !values[field]) ||
      (values[field] && values[field].length === 0)
    ) {
      errors[field] = 'fill-field';
    }
  });

  return errors;
};

const onSubmit = async (values: FormValues) => {
  const input = {
    ...values,
    provider: 'MAPBOX',
  };

  try {
    await ChangeMapProviderTokenMutation.commit({ input });
  } catch (e) {
    throw new SubmissionError({
      _error: e.message,
    });
  }
};

const MapboxAdminConfig = (props: Props) => {
  const {
    mapToken: { styles, id },
    invalid,
    submitting,
    handleSubmit,
    error,
  } = props;

  return (
    <form className="mapbox__config" onSubmit={handleSubmit}>
      <TitleContainer>
        <img src="/svg/mapbox_logo.svg" width={32} height={32} alt="Mapbox" />
        <h3>Mapbox</h3>
      </TitleContainer>
      <p className="help-block sonata-ba-field-help">
        <FormattedMessage id="desc-text-mapbox" />
      </p>
      {error && <FormattedMessage tagName="p" id={error} />}
      <Field
        name="publicToken"
        component={component}
        type="text"
        id="token"
        help={<FormattedMessage id="helptext-api-key" />}
        label={<FormattedMessage id="public-api-key" />}
      />
      <div className="clearfix" />
      <Field
        name="secretToken"
        component={component}
        type="text"
        id="token"
        help={<FormattedMessage id="helptext-api-key" />}
        label={<FormattedMessage id="secret-api-key" />}
      />
      <div className="clearfix" />
      <Button
        disabled={invalid || submitting}
        type="submit"
        bsStyle="primary"
        className="mb-15"
        id="user-admin-profile-save">
        <SubmitButtonInner>
          {submitting ? (
            <Loader show inline size={20} color="white" />
          ) : (
            <FormattedMessage id="verify" />
          )}
        </SubmitButtonInner>
      </Button>
      <ListGroup>
        {styles &&
          styles.map(style => (
            <MapAdminStyleListItem key={style.id} style={style} mapTokenId={id} />
          ))}
      </ListGroup>
    </form>
  );
};

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(MapboxAdminConfig);

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, { mapToken }: Props) => ({
  initialValues: {
    secretToken: mapToken ? mapToken.secretToken : '',
    publicToken: mapToken ? mapToken.publicToken : '',
  },
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment MapboxAdminConfig_mapToken on MapToken {
      id
      publicToken
      secretToken
      provider
      styleOwner
      styleId
      styles {
        id
        owner
        name
        previewUrl
        createdAt
        updatedAt
        isCurrent
      }
    }
  `,
);
