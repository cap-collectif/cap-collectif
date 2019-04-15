// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroup } from 'react-bootstrap';
import type { ContactAdminList_query } from '~relay/ContactAdminList_query.graphql';
import ContactAdminListItem from './ContactAdminListItem';
import ContactFormAdminAdd from './ContactFormAdminAdd';

type Props = {
  query: ContactAdminList_query,
};

class ContactAdminList extends React.Component<Props> {
  renderContactsList() {
    const { query } = this.props;
    if (query.contactForms && query.contactForms.length > 0) {
      const contactForms = query.contactForms.filter(Boolean);
      return (
        <ListGroup>
          {contactForms.filter(Boolean).map(contactForm => (
            // $FlowFixMe
            <ContactAdminListItem key={contactForm.id} contactForm={contactForm} />
          ))}
        </ListGroup>
      );
    }
    return <FormattedMessage id="admin.fields.step.no_proposal_form" />;
  }

  render() {
    return (
      <div className="form-group">
        <h4>
          <strong>
            <FormattedMessage id="forms-list" />
            <br />
            <span className="excerpt small">
              <FormattedMessage id="forms-list-helptext" />
            </span>
          </strong>
        </h4>
        {this.renderContactsList()}
        <ContactFormAdminAdd />
      </div>
    );
  }
}

export default createFragmentContainer(ContactAdminList, {
  query: graphql`
    fragment ContactAdminList_query on Query {
      contactForms {
        ...ContactAdminListItem_contactForm
      }
    }
  `,
});
