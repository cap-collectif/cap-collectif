// @flow
import * as React from 'react';
import { TextRow } from 'react-placeholder/lib/placeholders';
import colors from '~/utils/colors';
import Container, {
  Picture,
  LeftContainer,
  RightContainer,
  ContentContainer,
} from './ProjectAnalysisPreviewPlaceholder.style';

const ProjectAnalysisPreviewPlaceholder = () => (
  <Container>
    <Picture color={colors.borderColor} />

    <ContentContainer>
      <LeftContainer>
        <TextRow color="#3b88fd" style={{ width: 320, opacity: 0.15 }} />
        <TextRow color={colors.borderColor} style={{ width: 260 }} />
      </LeftContainer>

      <RightContainer>
        <TextRow color={colors.borderColor} style={{ width: 150 }} />
        <TextRow color={colors.borderColor} style={{ width: 150, marginLeft: 30 }} />
      </RightContainer>
    </ContentContainer>
  </Container>
);

export default ProjectAnalysisPreviewPlaceholder;
