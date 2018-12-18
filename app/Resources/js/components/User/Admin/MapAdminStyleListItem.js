// @flow
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';

type Props = {
  +style: {
    +id: string,
    +owner: string,
    +name: string,
    +previewUrl: string,
    +createdAt: any,
    +updatedAt: ?any,
    +isCurrent: boolean,
  },
};

const MapAdminStyleListItem = (props: Props) => {
  const { style } = props;

  return (
    <Row className={style.isCurrent ? 'current' : ''}>
      <Col lg={4}>
        <img src={style.previewUrl} alt={`${style.name} preview`} />
      </Col>
      <Col lg={8}>
        <p>{style.name}</p>
      </Col>
    </Row>
  );
};

export default MapAdminStyleListItem;
