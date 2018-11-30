// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';

const AddButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    bsStyle="primary"
    className="btn-outline-primary box-content__toolbar mb-5"
    onClick={onClick}>
    <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
  </Button>
);

export default AddButton;
