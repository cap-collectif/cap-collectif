// @flow
import * as React from 'react';
import { RoundShape, TextRow } from 'react-placeholder/lib/placeholders';
import colors from '~/utils/colors';
import { Container } from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipant/ProjectAdminParticipant.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import {
  TagContainer,
  ListRowMeta,
  InformationsContainer,
} from './AnalysisPlaceholderParticipant.style';

const AnalysisPlaceholderParticipant = () => (
  <Container isSelectable={false}>
    <InformationsContainer>
      <TextRow color={colors.borderColor} style={{ width: 150, height: 20, marginTop: 0 }} />
      <TextRow color={colors.borderColor} style={{ width: 250 }} />

      <ListRowMeta>
        <TagContainer>
          <Icon name={ICON_NAME.singleManFilled} size={12} color={colors.darkGray} />
          <TextRow color={colors.borderColor} style={{ width: 50 }} />
        </TagContainer>
        <TagContainer>
          <Icon name={ICON_NAME.paperPlane} size={12} color={colors.darkGray} />
          <TextRow color={colors.borderColor} style={{ width: 150 }} />
        </TagContainer>
        <TagContainer>
          <Icon name={ICON_NAME.like} size={12} color={colors.darkGray} />
          <TextRow color={colors.borderColor} style={{ width: 50 }} />
        </TagContainer>
        <TagContainer>
          <Icon name={ICON_NAME.messageBubbleFilled} size={12} color={colors.darkGray} />
          <TextRow color={colors.borderColor} style={{ width: 50 }} />
        </TagContainer>
      </ListRowMeta>
    </InformationsContainer>

    <RoundShape color={colors.borderColor} style={{ width: 50, height: 50 }} />
  </Container>
);

export default AnalysisPlaceholderParticipant;
