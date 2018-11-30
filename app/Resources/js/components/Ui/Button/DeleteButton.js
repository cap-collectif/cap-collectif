// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';

const DeleteButton = ({ handleOnClick }: { handleOnClick: () => void }) => (
  <Button bsStyle="danger" className="btn-outline-danger" onClick={handleOnClick}>
    <i className="cap cap-times" /> <FormattedMessage id="global.delete" />
  </Button>
);

export default DeleteButton;
