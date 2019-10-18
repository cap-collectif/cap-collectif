// @flow
import styled from 'styled-components';

/* NOTE: don't put relative position into this component because it's break Dialog positioning */
export const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 5px;

  & + & {
    border-left: 1px solid rgba(204, 204, 204, 1);
  }
`;

/* NOTE: don't put relative position into this component because it's break Dialog positioning */
export const Toolbar = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-bottom: 1px solid rgba(204, 204, 204, 1);
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 15px 10px;
  width: 100%;
`;
