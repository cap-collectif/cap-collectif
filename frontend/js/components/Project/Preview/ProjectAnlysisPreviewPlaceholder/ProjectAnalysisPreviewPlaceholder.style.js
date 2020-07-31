// @flow
import styled, { type StyledComponent } from 'styled-components';
import { TextRow } from 'react-placeholder/lib/placeholders';
import colors from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import { blink } from '~/utils/styles/keyframes';

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 110px;
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid ${colors.borderColor};
  ${MAIN_BORDER_RADIUS};
  overflow: hidden;
  animation: ${blink} 0.6s linear infinite alternate;
`;

export const Picture: StyledComponent<{}, {}, typeof TextRow> = styled(TextRow)`
  height: 100% !important;
  width: 100px !important;
  margin-top: 0 !important;
`;

export const ContentContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .text-row {
    height: 20px !important;
  }
`;

export const LeftContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RightContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
`;

export default Container;
