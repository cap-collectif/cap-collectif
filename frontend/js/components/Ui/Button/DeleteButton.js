// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';

const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <Button className="btn-outline-danger" bsStyle="danger" onClick={onClick}>
    <i className="cap-bin-2" />
  </Button>
);

export default DeleteButton;
