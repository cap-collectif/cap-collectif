// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Container } from './NoParticipant.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import { getDifferenceFilters, getWordingEmpty } from '../ProjectAdminParticipants.utils';
import { useProjectAdminParticipantsContext } from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipant.context';

const NoParticipant = () => {
  const { parameters } = useProjectAdminParticipantsContext();
  const hasSelectedFilters = getDifferenceFilters(parameters.filters);
  const wording = getWordingEmpty(hasSelectedFilters);

  return (
    <Container isSelectable={false}>
      <Icon name={ICON_NAME.singleMan} size={50} color={colors.darkGray} />
      <FormattedMessage id={wording.title} tagName="p" />
      <FormattedMessage id={wording.text} tagName="p" />
    </Container>
  );
};

export default NoParticipant;
