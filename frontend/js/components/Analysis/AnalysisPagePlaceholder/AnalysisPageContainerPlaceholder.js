// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { AnalysisHeaderContainer } from '~/components/Analysis/AnalysisHeader/AnalysisHeader.style';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 80px;
`;

type Props = {
  children: React.Node,
};

const AnalysisPageContainerPlaceholder = ({ children }: Props) => (
  <>
    <AnalysisHeaderContainer>
      <FormattedMessage tagName="h1" id="page.title.analysis.tool" />
    </AnalysisHeaderContainer>

    <Container>{children}</Container>
  </>
);

export default AnalysisPageContainerPlaceholder;
