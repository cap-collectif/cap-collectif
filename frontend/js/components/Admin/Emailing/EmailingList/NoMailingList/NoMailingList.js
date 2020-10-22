// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Container } from './NoMailingList.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';

const NoMailingList = () => (
  <Container>
    <Icon name={ICON_NAME.fileIcon2} color={colors.darkGray} size={42} />

    <FormattedMessage id="empty.mailingList" tagName="p" />
    <FormattedMessage id="empty.mailingList.indication" tagName="p" />
  </Container>
);

export default NoMailingList;
