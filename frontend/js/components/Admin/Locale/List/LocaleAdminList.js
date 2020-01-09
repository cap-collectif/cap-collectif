// @flow
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';

import LocaleAdminModal from '../Modal/LocaleAdminModal';
import LocaleAdminListItem from './LocaleAdminListItem';
import { ListGroup } from '~/components/Ui/List/ListGroup';
import type { LocaleAdminList_locales } from '~relay/LocaleAdminList_locales.graphql';

type Props = {|
  locales: LocaleAdminList_locales,
|};

export const LocaleAdminList = ({ locales }: Props) => {
  const [showModal, displayModal] = useState(false);

  if (locales !== null && locales.length > 0) {
    return (
      <div>
        <ListGroup>
          {locales.map(locale => locale.isEnabled && <LocaleAdminListItem locale={locale} />)}
        </ListGroup>
        <Button
          bsStyle="primary"
          className="btn-outline-primary box-content__toolbar mb-5"
          onClick={() => displayModal(true)}>
          <i className="cap cap-add-1" /> <FormattedMessage id="global.add" />
        </Button>
        <LocaleAdminModal show={showModal} displayModal={displayModal} locales={locales} />
      </div>
    );
  }

  return null;
};

export default createFragmentContainer(LocaleAdminList, {
  locales: graphql`
    fragment LocaleAdminList_locales on Locale @relay(plural: true) {
      ...LocaleAdminListItem_locale
      ...LocaleAdminModal_locales
      isPublished
      isEnabled
    }
  `,
});
