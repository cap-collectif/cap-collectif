// @flow
import styled, { type StyledComponent } from 'styled-components';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import colors from '~/utils/colors';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background: #fff;
  border: 1px solid #d1d5da;
  ${MAIN_BORDER_RADIUS};
  padding: 15px 20px;
  margin: 15px;

  h3 {
    font-weight: 600;
    color: #000;
    padding-bottom: 6px;
    border-bottom: 1px solid #e3e3e3;
    margin: 0 0 15px 0;
  }

  .editor .ql-editor {
    min-height: 450px;
  }

  .error-block a {
    color: ${colors.dangerColor};
    pointer-events: none;
  }

  .rdtPicker {
    width: 340px;

    td,
    th {
      height: 50px;
    }

    .rdtNext,
    .rdtPrev {
      vertical-align: middle;
    }
  }
`;
