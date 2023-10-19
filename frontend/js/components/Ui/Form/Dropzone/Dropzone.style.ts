import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import colors from '~/utils/colors'

const DropzoneContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  padding: 40px;
  border: 2px dashed ${colors.borderColor};
  background-color: #fafafa;
  border-radius: 4px;
  color: ${colors.darkGray};
  font-size: 16px;

  .btn-pick-file {
    background-color: transparent;
    color: ${colors.primaryColor};
    border: 1px solid ${colors.primaryColor};
    border-radius: 4px;
    margin-top: 15px;
    padding: 6px 15px;
  }

  .fakeLoaderBar-container {
    margin-top: 15px;
  }
`
export default DropzoneContainer
