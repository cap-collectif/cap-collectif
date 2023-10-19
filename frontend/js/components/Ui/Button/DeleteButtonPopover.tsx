import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Button as BootstrapButton } from 'react-bootstrap'
import Button from '~ds/Button/Button'
import Popover from '~ds/Popover/index'
type Props = {
  readonly handleValidate: () => void
  readonly id: string
}
export class DeleteButtonPopover extends React.Component<Props> {
  render() {
    const { id, handleValidate } = this.props
    return (
      <Popover placement="left" trigger={['click']}>
        <Popover.Trigger>
          <Button
            id={`${id}-DeleteButton`}
            className="btn-outline-danger"
            style={{
              marginLeft: '5px',
              display: 'inline-flex',
            }}
            variant="secondary"
            variantSize="small"
            variantColor="danger"
          >
            <div>
              <i className="cap cap-times" />
            </div>
            <span className="hidden-xs ml-5">
              <FormattedMessage id="global.delete" />
            </span>
          </Button>
        </Popover.Trigger>

        <Popover.Content padding={0}>
          {({ closePopover }) => (
            <>
              <Popover.Header className="popover-title" mb={1}>
                <FormattedMessage id="are-you-sure-you-want-to-delete-this-item" />
              </Popover.Header>
              <Popover.Body
                style={{
                  padding: '8px 14px',
                }}
                mb={1}
              >
                <BootstrapButton
                  onClick={() => {
                    handleValidate()
                  }}
                  id="btn-confirm-delete-field"
                  bsStyle="danger"
                  className="right-bloc btn-block"
                >
                  <FormattedMessage id="btn_delete" />
                </BootstrapButton>
                <BootstrapButton
                  id="btn-cancel-delete-field"
                  bsStyle="default"
                  className="right-block btn-block"
                  onClick={closePopover}
                >
                  <FormattedMessage id="global.no" />
                </BootstrapButton>
              </Popover.Body>
            </>
          )}
        </Popover.Content>
      </Popover>
    )
  }
}
export default DeleteButtonPopover
