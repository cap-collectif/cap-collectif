// @flow
import { type ComponentType } from 'react';
import styled, { css } from 'styled-components';

type EditorWrapperProps = {
  id?: string,
  fullscreen: boolean,
};

export const EditorWrapper: ComponentType<EditorWrapperProps> = styled('div')`
  position: relative;
  max-width: 100%;
  height: 480px;
  margin: auto;
  border: 2px solid rgba(0, 0, 0, 1);
  display: flex;
  flex-direction: column;
  overflow: ${({ focused }) => (focused ? 'scroll' : 'hidden')};
  ${({ fullscreen }) =>
    fullscreen &&
    css`
      background-color: rgba(255, 255, 255, 1);
      position: fixed;
      top: 0;
      left: 0;
      border: 0;
      max-width: 100%;
      max-height: 100%;
      width: 100vw;
      height: 100vh;
      z-index: 99999;
    `}
`;

export const NotificationBanner: ComponentType<{}> = styled('div')`
  position: sticky;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 1);
  color: black;
  font-size: 14px;
  line-height: 14px;
  padding: 2px 4px;
  border-top: 2px solid rgba(0, 0, 0, 1);
`;
