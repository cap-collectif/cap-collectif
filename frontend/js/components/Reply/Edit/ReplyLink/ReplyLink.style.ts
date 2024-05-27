import styled from 'styled-components'
import colors from '~/utils/colors'

const ReplyLinkContainer = styled.div.attrs({
  className: 'replyLink',
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 10px;
  border: none;
  border-bottom: 1px solid ${colors.lightGray};
  width: 100%;

  &:last-child {
    border: none;
  }

  .btn-delete {
    background-color: rgba(220, 53, 69, 0.15);
    width: 30px;
    height: 30px;
    line-height: 15px;
    border-radius: 15px;
    border: none;
    padding: 7px;

    svg,
    path {
      fill: ${colors.dangerColor};
    }
  }
`
export default ReplyLinkContainer
