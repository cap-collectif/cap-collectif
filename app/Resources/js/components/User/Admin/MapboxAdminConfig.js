// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, ListGroup } from 'react-bootstrap';
import { type MapStateToProps, connect } from 'react-redux';
import { Field, reduxForm, type FormProps, SubmissionError } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';
import type { MapboxAdminConfig_mapToken } from './__generated__/MapAdminPageQuery.graphql';
import ChangeMapProviderTokenMutation from '../../../mutations/ChangeMapProviderTokenMutation';
import type { GlobalState } from '../../../types';
import component from '../../Form/Field';
import MapAdminStyleListItem from './MapAdminStyleListItem';

type FormValues = {
  +publicToken: string,
  +secretToken: ?string,
};

type Props = FormProps & {
  mapToken: MapboxAdminConfig_mapToken,
};

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
      <img src="/svg/mapbox_logo.svg" width={32} height={32} alt="Mapbox" />
      <h3 className="d-inline-block">Mapbox</h3>
      <FormattedMessage tagName="p" id="desc-text-mapbox" />
      {error && <FormattedMessage tagName="p" id={error} />}
      <Field
        name="publicToken"
        component={component}
        type="text"
        id="token"
        label="Clé Public API"
        divClassName="col-sm-8"
      />
      <div className="clearfix" />
      <Field
        name="secretToken"
        component={component}
        type="text"
        id="token"
        label="Clé Secrète API"
        divClassName="col-sm-8"
      />
      <div className="clearfix" />
      <Button
        disabled={invalid || submitting}
        type="submit"
        bsStyle="primary"
        id="user-admin-profile-save">
        <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'} />
      </Button>
      <div className="clearfix" />
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
