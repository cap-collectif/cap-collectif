// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ContactsListView_query } from '~relay/ContactsListView_query.graphql';
import ContactForm from './ContactForm';
import CollapseGroup from '../CollapseGroup/CollapseGroup';

type Props = {
  query: ContactsListView_query,
};

export class ContactsListView extends React.Component<Props> {
  render() {
    const { query } = this.props;
    if (query.contactForms && query.contactForms.length > 0) {
      const contactForms = query.contactForms.filter(Boolean);
      if (contactForms.length === 1 && contactForms[0]) {
        return <ContactForm contactForm={contactForms[0]} />;
      }
      return (
        <div>
          <h3>
            <FormattedMessage id="which-question" />
          </h3>
          <div className="contact__form__list">
            <CollapseGroup labels={contactForms.map(contactForm => contactForm.title)}>
              {contactForms.map((contactForm, id) => (
                <ContactForm key={id} contactForm={contactForm} />
              ))}
            </CollapseGroup>
          </div>
        </div>
      );
    }
    return null;
  }
}

export default createFragmentContainer(ContactsListView, {
  query: graphql`
    fragment ContactsListView_query on Query {
      contactForms {
        title
        ...ContactForm_contactForm
      }
    }
  `,
});
