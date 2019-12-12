// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';

const SmallEditButton: StyledComponent<{}, {}, Button> = styled(Button)`
  border-color: #6c757d;
  background-color: transparent;
`;

const EditButton = ({ onClick, small }: { onClick: () => void, small: boolean }) =>
  !small ? (
    <Button bsStyle="warning" className="btn-outline-warning" onClick={onClick}>
      <i className="fa fa-pencil" />
      <span className="hidden-xs">
        <FormattedMessage id="global.edit" className="hidden-xs" />
      </span>
    </Button>
  ) : (
    <SmallEditButton onClick={onClick}>
      <i className="cap-pencil-2" />
    </SmallEditButton>
  );
EditButton.defaultProps = { small: false };

export default EditButton;
