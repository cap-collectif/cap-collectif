// @flow
import * as React from 'react';
import { TextRow } from 'react-placeholder/lib/placeholders';
import colors from '~/utils/colors';
import AnalysisPlaceholderProposalContainer from '~/components/Analysis/AnalysisProposal/AnalysisProposal.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import {
  TagContainer,
  ListRowMeta,
  HeaderInformations,
  InformationsContainer,
} from './AnalysisPlaceholderProposal.style';

type Props = {
  children: React.Node,
};

const AnalysisPlaceholderProposal = ({ children }: Props) => (
  <AnalysisPlaceholderProposalContainer>
    <InformationsContainer>
      <HeaderInformations>
        <TextRow color="#3b88fd" />
        <TextRow color={colors.borderColor} />
      </HeaderInformations>

      <ListRowMeta>
        <TagContainer>
          <Icon name={ICON_NAME.pin} size={12} />
          <TextRow color={colors.borderColor} />
        </TagContainer>
        <TagContainer>
          <Icon name={ICON_NAME.tag} size={12} />
          <TextRow color={colors.borderColor} />
        </TagContainer>
      </ListRowMeta>
    </InformationsContainer>

    {children}
  </AnalysisPlaceholderProposalContainer>
);

export default AnalysisPlaceholderProposal;
