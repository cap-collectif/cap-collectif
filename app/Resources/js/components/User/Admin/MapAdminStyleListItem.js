// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import classNames from 'classnames';
import moment from 'moment';
import ChangeMapStyleMutation from '../../../mutations/ChangeMapStyleMutation';
import type { ChangeMapStyleMutationResponse } from '../../../mutations/ChangeMapStyleMutation';

const ListGroupItemInner = styled.div`
  display: flex;
  &.disabled img {
    filter: grayscale(100%);
  }
  & .map__check {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    width: 32px;
    height: 32px;
    margin: auto 1.5rem auto 0;
    border: 1px solid #e3e3e3;
    background: transparent;
    & i {
      color: white;
      margin-left: 4px;
      display: none;
    }
    &.checked {
      background: #0d6aad;
      & i {
        display: block;
      }
    }
  }
  & .map__preview {
    width: 64px;
    height: 64px;
    border-radius: 4px;
    margin-right: 1.5rem;
  }
  & .map__title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
`;

type Props = {
  +mapTokenId: string,
  +disabled: boolean,
  +onMutationStart?: () => void,
  +onMutationEnd?: (response: ChangeMapStyleMutationResponse) => void,
  +onMutationFailed?: (e: Object) => void,
  +style: {
    +id: string,
    +owner: string,
    +name: string,
    +previewUrl: string,
    +createdAt: Date,
    +updatedAt: ?Date,
    +isCurrent: boolean,
  },
};

const MapAdminStyleListItem = (props: Props) => {
  const { style, mapTokenId, onMutationEnd, onMutationFailed, onMutationStart, disabled } = props;

  const handleItemClick = async () => {
    if (disabled || style.isCurrent) {
      return;
    }

    const { owner, id } = style;
    const input = {
      mapTokenId,
      styleOwner: owner,
      styleId: id,
    };
    try {
      if (onMutationStart) {
        onMutationStart();
      }
      const response = await ChangeMapStyleMutation.commit({ input });
      if (onMutationEnd) {
        onMutationEnd(response);
      }
    } catch (e) {
      if (onMutationFailed) {
        onMutationFailed(e);
      }
    }
  };

  return (
    <ListGroupItem onClick={handleItemClick} disabled={disabled}>
      <ListGroupItemInner className={classNames({ disabled })}>
        <div className={classNames('map__check', { checked: style.isCurrent })}>
          <i className="cap cap-check-4" />
        </div>
        <img src={style.previewUrl} alt={`${style.name} preview`} className="map__preview" />
        <div className="map__infos">
          <p className="map__title">{style.name}</p>
          <p className="help-block sonata-ba-field-help">
            <FormattedMessage
              id={style.updatedAt ? 'map-settings-style-updated' : 'map-settings-style-created'}
            />{' '}
            {moment(style.updatedAt ? style.updatedAt : style.createdAt).fromNow()}
          </p>
        </div>
      </ListGroupItemInner>
    </ListGroupItem>
  );
};

export default MapAdminStyleListItem;
