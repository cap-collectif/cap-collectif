import styled from 'styled-components'
import colors from '~/utils/colors'
import { mediaQueryMobile } from '~/utils/sizes'

const FileContainer = styled.div.attrs({
  className: 'file-container',
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${colors.lightGray};
  border-radius: 4px;
  background-color: #fafafa;
  padding: 10px 12px;
  width: 300px;
  font-size: 16px;

  & > div {
    display: flex;
    align-items: center;
  }

  .file-name {
    margin-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    flex: 1;
    text-overflow: ellipsis;

    svg {
      margin-right: 6px;
      flex-shrink: 0;
    }

    & > a {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  .btn-delete {
    border: none;
    background-color: rgba(220, 53, 69, 0.15);
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 12px;
    margin-left: 10px;

    svg {
      display: block;
      margin: auto;
      fill: ${colors.dangerColor};
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 100%;
    margin-bottom: 10px;
  }
`
export default FileContainer
