// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  height: 32px;
  width: 40px;
  ${MAIN_BORDER_RADIUS};
  background: ${colors.formBgc};
  border: 1px solid ${colors.borderColor};
  padding: 5px 12px;
`;

const getIconName = (extension: string) => {
  switch (extension) {
    case 'pdf':
      return ICON_NAME.pdfIcon;
    case 'mp4':
      return ICON_NAME.vidIcon;
    case 'doc':
      return ICON_NAME.docIcon;
    case 'zip':
      return ICON_NAME.zipIcon;
    default:
      return ICON_NAME.fileIcon;
  }
};

export const MediaAdminFileView = ({ extension }: {| extension: string |}) => (
  <Container>
    <Icon name={getIconName(extension)} size={15} color={colors.white} />
  </Container>
);

export default MediaAdminFileView;
