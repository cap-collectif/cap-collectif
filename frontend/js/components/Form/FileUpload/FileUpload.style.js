// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const FileUploadContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'fileUpload-container',
})`
  .file-list {
    display: flex;
    flex-direction: column;
    margin-top: 10px;

    .file-container {
      margin-bottom: 10px;
    }
  }

  .wrapper-error {
    display: flex;
    align-items: center;
    margin: 10px 0;
    color: ${colors.error};

    svg {
      margin-right: 10px;
    }
  }
`;

export default FileUploadContainer;
