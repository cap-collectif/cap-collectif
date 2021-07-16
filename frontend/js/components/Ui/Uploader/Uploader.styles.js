// @flow
import type { StyledComponent } from 'styled-components';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import colors from '~/styles/modules/colors';
import { UPLOADER_SIZE } from './Uploader';
import type { Responsive } from '~ui/Primitives/AppBox.type';
import AppBox from '~ui/Primitives/AppBox';

export const Container: StyledComponent<
  { size: Responsive<$Values<typeof UPLOADER_SIZE>>, circle: boolean, drag: boolean },
  {},
  any,
> = styled.div`
  height: 184px;
  width: ${props => {
    switch (props.size) {
      case UPLOADER_SIZE.LG:
        return '488px';
      case UPLOADER_SIZE.SM:
        return '184px';
      default:
        return '240px';
    }
  }};
  background-color: transparent;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  border: 1.5px dashed ${colors.gray[300]};
  border-radius: ${props => (props.size === UPLOADER_SIZE.SM && !!props.circle ? '50%' : '4px')};
  overflow: hidden;
  position: relative;
  &:focus {
    background-color: ${colors.blue[100]};
    border: 1.5px dashed ${colors.blue[300]};
    box-shadow: 0 0 2px 2px ${colors.blue[300]};
  }
  &:hover {
    background-color: ${colors.blue[100]};
    border: 1.5px dashed ${colors.blue[300]};
  }

  ${({ drag }) =>
    drag &&
    `background-color: ${colors.blue[100]};
    border: 1.5px dashed ${colors.blue[300]};
  `}
`;
export const Content: StyledComponent<{}, {}, any> = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
`;
export const UploaderContainer: StyledComponent<
  { size: Responsive<$Values<typeof UPLOADER_SIZE>> },
  {},
  any,
> = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  position: relative;
  width: ${props => {
    switch (props.size) {
      case UPLOADER_SIZE.LG:
        return '488px';
      case UPLOADER_SIZE.SM:
        return '184px';
      default:
        return '240px';
    }
  }};
`;
export const ThumbContainer: StyledComponent<{}, {}, any> = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #fff;
`;
export const Thumbnail: StyledComponent<
  { size: Responsive<$Values<typeof UPLOADER_SIZE>>, circle?: boolean },
  {},
  any,
> = styled.img`
  width: ${props =>
    props.size === UPLOADER_SIZE.SM && !!props.circle ? 'calc(100% - 16px);' : 'calc(100% - 32px)'};
  height: ${props =>
    props.size === UPLOADER_SIZE.SM && !!props.circle ? 'calc(100% - 16px);' : 'calc(100% - 32px)'};
  margin: ${props => (props.size === UPLOADER_SIZE.SM && !!props.circle ? '8px' : '16px')};
  border-radius: ${props => (props.size === UPLOADER_SIZE.SM && !!props.circle ? '50%' : '4px')};
  overflow: hidden;
  object-fit: cover;
`;
export const ThumbnailControls: StyledComponent<
  { size: Responsive<$Values<typeof UPLOADER_SIZE>>, circle?: boolean },
  {},
  any,
> = styled.div`
  width: ${props =>
    props.size === UPLOADER_SIZE.SM && !!props.circle ? 'calc(100% - 16px);' : 'calc(100% - 32px)'};
  height: ${props =>
    props.size === UPLOADER_SIZE.SM && !!props.circle ? 'calc(100% - 16px);' : 'calc(100% - 32px)'};
  margin: ${props => (props.size === UPLOADER_SIZE.SM && !!props.circle ? '8px' : '16px')};
  border-radius: ${props => (props.size === UPLOADER_SIZE.SM && !!props.circle ? '50%' : '4px')};
  background: transparent;
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  & > button {
    opacity: 0 !important;
  }
  &:hover {
    background: linear-gradient(0deg, rgba(39, 43, 48, 0.32), rgba(39, 43, 48, 0.32));
    & > div > svg {
      color: ${colors.white};
    }
    & > button {
      opacity: 1 !important;
    }
  }
`;
export const FileList: StyledComponent<{}, {}, any> = styled.ul`
  margin-top: 8px;
  margin-bottom: 0;
  list-style: none;
  width: 100%;
  padding: 0;
`;
export const FileItem: StyledComponent<{}, {}, any> = styled.li`
  display: flex;
  flex-flow: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  & > button {
    opacity: 0 !important;
  }
  &:hover {
    background-color: ${colors.gray[100]};
    & > div > svg {
      color: ${colors.gray[700]};
    }
    & > button {
      opacity: 1 !important;
    }
  }
`;
export const ErrorList: StyledComponent<{}, {}, any> = styled(AppBox).attrs({ mt: 2, p: 4 })`
  width: 100%;
  background-color: ${colors.red[100]};
  border: 1px solid ${colors.red[200]};
  border-radius: 4px;
  display: flex;
  flex-flow: column;
`;
export const WarningList: StyledComponent<{}, {}, any> = styled(AppBox).attrs({ mt: 2, p: 4 })`
  width: 100%;
  background-color: ${colors.orange[100]};
  border: 1px solid ${colors.orange[200]};
  border-radius: 4px;
  display: flex;
  flex-flow: column;
`;
