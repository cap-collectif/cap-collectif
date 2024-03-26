import styled from 'styled-components'
import colors from '~/utils/colors'

export const EventMapPreviewContainer = styled.div.attrs({
  className: 'eventMapPreview',
})`
  .card {
    margin: 0;
    border: none;
  }

  .eventImage {
    height: 83px;
    max-height: 83px;
  }

  .card__title {
    margin-bottom: 10px;
    font-weight: 600;
  }

  .card__date {
    padding-left: 5px;
  }

  .tag {
    i {
      color: ${colors.darkGray};
    }
  }
`
export default EventMapPreviewContainer
