// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

export const EventMapPreviewContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'eventMapPreview',
})`
  .card {
    margin: 0;
    border: none;
  }

  .eventImage {
    height: 70px;
  }

  .card__title {
    margin-bottom: 10px;
    font-weight: 600;
  }

  .tag {
    i {
      color: ${colors.darkGray};
    }
  }
`;

export default EventMapPreviewContainer;
