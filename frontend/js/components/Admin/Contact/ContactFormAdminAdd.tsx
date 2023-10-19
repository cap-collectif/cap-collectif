import * as React from 'react'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import ContactFormAdminModal from './ContactFormAdminModal'
type Props = {}
type State = {
  readonly showAddContactFormModal: boolean
}
export default class ContactFormAdminAdd extends React.Component<Props, State> {
  state: State = {
    showAddContactFormModal: false,
  }

  render(): JSX.Element | JSX.Element[] | string {
    const { showAddContactFormModal } = this.state
    return (
      <div>
        <ContactFormAdminModal
          contactForm={null}
          onClose={(): void => {
            this.setState({
              showAddContactFormModal: false,
            })
            window.location.reload()
          }}
          show={showAddContactFormModal}
        />
        <Button
          type="submit"
          id="openAddModalButton"
          bsStyle="default"
          className="mt-10"
          onClick={(): void => {
            this.setState({
              showAddContactFormModal: true,
            })
          }}
        >
          <FormattedMessage id="global.add" />
        </Button>
      </div>
    )
  }
}
