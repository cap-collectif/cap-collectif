import styled from 'styled-components'
import colors from '~/utils/colors'

export const PopoverToggleViewContainer = styled.div`
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .title {
    font-weight: 600;
    margin: 0;
  }

  .description {
    margin: 15px 0;
    color: ${colors.darkGray};
  }
`
export const ListStep = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`
