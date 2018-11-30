// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';

const EditButton = ({ onClick }: { onClick: () => void }) => (
  <Button bsStyle="warning" className="btn-outline-warning" onClick={onClick}>
    <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
  </Button>
);

export default EditButton;
