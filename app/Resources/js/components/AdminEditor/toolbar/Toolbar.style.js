// @flow
import { type ComponentType } from 'react';
import styled from 'styled-components';

/* NOTE: don't put relative position into this component because it's break Dialog positioning */
export const ToolbarGroup: ComponentType<{}> = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 5px;

  & + & {
    border-left: 1px solid rgba(204, 204, 204, 1);
  }
`;

/* NOTE: don't put relative position into this component because it's break Dialog positioning */
export const Toolbar: ComponentType<{}> = styled('div')`
  background-color: rgba(255, 255, 255, 1);
  border-bottom: 1px solid rgba(204, 204, 204, 1);
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 15px 10px;
  width: 100%;
  z-index: 99;
  position: sticky;
  top: 0;
`;
