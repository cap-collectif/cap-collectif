// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import ChangeMapStyleMutation from '../../../mutations/ChangeMapStyleMutation';

type Props = {
  +mapTokenId: string,
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
  const { style, mapTokenId } = props;

  const handleItemClick = async () => {
    console.log('clicked on', style);
    const { owner, id } = style;
    const input = {
      mapTokenId,
      styleOwner: owner,
      styleId: id,
    };
    await ChangeMapStyleMutation.commit({ input });
  };

  return (
    <ListGroupItem active={style.isCurrent} onClick={handleItemClick}>
      <img src={style.previewUrl} alt={`${style.name} preview`} />
      <p>{style.name}</p>
    </ListGroupItem>
  );
};

export default MapAdminStyleListItem;
