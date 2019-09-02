// @flow
import * as React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Button, ListGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import styled from 'styled-components';
import ChangeMapProviderTokenMutation from '../../../mutations/ChangeMapProviderTokenMutation';
import type { GlobalState } from '../../../types';
import component from '../../Form/Field';
import MapAdminStyleListItem from './MapAdminStyleListItem';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import AlertForm from '../../Alert/AlertForm';
import type { MapboxAdminConfig_mapToken } from '~relay/MapboxAdminConfig_mapToken.graphql';

type FormValues = {
  +publicToken: string,
  +secretToken: string,
};

type Props = {|
  ...ReduxFormFormProps,
  mapToken: MapboxAdminConfig_mapToken,
|};

type State = {
  loading: boolean,
  stylesSubmitSucceeded: boolean,
  stylesSubmitFailed: boolean,
};

type Action = {
  type: 'MUTATION_START' | 'MUTATION_END' | 'MUTATION_FAILED',
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
  const fields = ['publicToken', 'secretToken'];

  fields.forEach(field => {
    if (
      (field === 'publicToken' && !values[field]) ||
      (field === 'secretToken' && !values[field]) ||
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

const initialState: State = {
  loading: false,
  stylesSubmitSucceeded: false,
  stylesSubmitFailed: false,
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'MUTATION_START':
      return {
        loading: true,
        stylesSubmitSucceeded: false,
        stylesSubmitFailed: false,
      };
    case 'MUTATION_END':
      return {
        loading: false,
        stylesSubmitSucceeded: true,
        stylesSubmitFailed: false,
      };
    case 'MUTATION_FAILED':
      return {
        loading: false,
        stylesSubmitSucceeded: false,
        stylesSubmitFailed: true,
      };
    default:
      throw new Error(`unknown action : ${action.type}`);
  }
};

export const MapboxAdminConfig = (props: Props) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const onMutationStart = React.useCallback(() => {
    dispatch({ type: 'MUTATION_START' });
  }, []);
  const onMutationEnd = React.useCallback(() => {
    dispatch({ type: 'MUTATION_END' });
  }, []);
  const onMutationFailed = React.useCallback(() => {
    dispatch({ type: 'MUTATION_FAILED' });
  }, []);

  const { loading, stylesSubmitFailed, stylesSubmitSucceeded } = state;
  const {
    // $FlowFixMe
    mapToken: { styles, id },
    invalid,
    submitting,
    handleSubmit,
    submitFailed,
    submitSucceeded,
    valid,
    error,
  } = props;

  const renderCustomStyles = () => (
    <div>
      <h3 className="d-ib">
        <FormattedMessage id="style" />
      </h3>
      {(stylesSubmitSucceeded || stylesSubmitFailed) && (
        <AlertForm
          valid
          invalid={false}
          submitting={loading}
          submitSucceeded={stylesSubmitSucceeded}
          submitFailed={stylesSubmitFailed}
        />
      )}
      <ListGroup>
        {styles &&
          styles
            .filter(Boolean)
            .map(style => (
              <MapAdminStyleListItem
                onMutationStart={onMutationStart}
                onMutationEnd={onMutationEnd}
                onMutationFailed={onMutationFailed}
                disabled={loading}
                key={style.id}
                style={style}
                mapTokenId={id}
              />
            ))}
      </ListGroup>
    </div>
  );

  return (
    <form className="mapbox__config" onSubmit={handleSubmit}>
      <TitleContainer>
        <img src="/svg/mapbox_logo.svg" width={32} height={32} alt="Mapbox" />
        <h3>Mapbox</h3>
      </TitleContainer>
      <p className="help-block sonata-ba-field-help">
        <FormattedMessage id="desc-text-mapbox" />
      </p>
      <Field
        name="publicToken"
        component={component}
        type="text"
        id="token"
        help={<FormattedHTMLMessage id="helptext-api-key" />}
        label={<FormattedMessage id="public-api-key" />}
      />
      <div className="clearfix" />
      <Field
        name="secretToken"
        component={component}
        type="text"
        id="token"
        help={<FormattedHTMLMessage id="helptext-api-key" />}
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
      <AlertForm
        valid={valid}
        invalid={false}
        submitting={submitting}
        submitSucceeded={submitSucceeded}
        submitFailed={submitFailed}
        errorMessage={error}
      />
      {styles && renderCustomStyles()}
    </form>
  );
};

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(MapboxAdminConfig);

const mapStateToProps = (state: GlobalState, { mapToken }: Props) => ({
  initialValues: {
    secretToken: mapToken ? mapToken.secretToken : '',
    publicToken: mapToken
      ? mapToken.publicToken !== state.user.mapTokens.MAPBOX.initialPublicToken
        ? mapToken.publicToken
        : ''
      : '',
  },
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  mapToken: graphql`
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
});
