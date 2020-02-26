// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, OverlayTrigger } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';

import Popover from '~/components/Utils/Popover';

type Props = {|
  +handleValidate: () => void,
  +handleCancel?: ?() => void,
  +id: string,
|};

const ButtonContainer: StyledComponent<{}, {}, typeof Button> = styled(Button)`
  div {
    display: inline;
  }
  @media (max-width: 768px) {
    max-width: 38px;
    div {
      display: block;
      margin-left: 1px;
    }
  }
`;

export class DeleteButtonPopover extends React.Component<Props> {
  overlayRef: any;

  constructor(props: Props) {
    super(props);
    this.overlayRef = React.createRef();
  }

  handleValidate = () => {
    this.overlayRef.current.hide();
    const { handleValidate } = this.props;
    if (typeof handleValidate === 'function') {
      handleValidate();
    }
  };

  handleCancel = () => {
    this.overlayRef.current.hide();
    const { handleCancel } = this.props;

    if (typeof handleCancel === 'function') {
      handleCancel();
    }
  };

  render() {
    const { id } = this.props;
    return (
      <OverlayTrigger
        trigger="click"
        placement="left"
        rootClose
        ref={this.overlayRef}
        overlay={
          <Popover
            placement="left"
            className="in"
            id={`${id}-Popover`}
            title={<FormattedMessage id="are-you-sure-you-want-to-delete-this-item" />}>
            <Button
              onClick={this.handleValidate}
              id="btn-confirm-delete-field"
              bsStyle="danger"
              className="right-bloc btn-block">
              <FormattedMessage id="btn_delete" />
            </Button>
            <Button
              id="btn-cancel-delete-field"
              bsStyle="default"
              className="right-block btn-block"
              onClick={this.handleCancel}>
              <FormattedMessage id="global.no" />
            </Button>
          </Popover>
        }>
        <ButtonContainer id={`${id}-DeleteButton`} bsStyle="danger" className="btn-outline-danger">
          <div>
            <i className="cap cap-times" />
          </div>
          <span className="hidden-xs ml-5">
            <FormattedMessage id="global.delete" />
          </span>
        </ButtonContainer>
      </OverlayTrigger>
    );
  }
}

export default DeleteButtonPopover;
