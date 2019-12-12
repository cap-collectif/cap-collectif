// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';

const EventPreviewContainer: StyledComponent<
  { isHighlighted?: boolean },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'eventPreview',
})`
  height: 100%;

  &.isHorizontal {
    .card {
      flex-direction: row;
      padding: 15px;
    }

    .eventImage {
      width: 180px;
      height: 100%;
      border-radius: 4px;
      overflow: hidden;
    }

    .card__body {
      flex-direction: column;
      margin-left: 15px;
      padding: 0;
      flex: 1;
    }

    .card__date {
      margin-right: 0;
      flex-direction: row;
      color: ${colors.darkText};

      .card__date__month {
        order: 2;
        margin-bottom: 0;
        color: inherit;
        font-weight: normal;
        text-transform: uppercase;
      }

      .card__date__day {
        order: 1;
        color: inherit;
      }
    }
  }

  .card {
    height: 100%;
    margin: 0;
    border: ${props => props.isHighlighted && `1px solid ${colors.primaryColor}`};
  }

  .eventImage {
    height: 190px;
  }

  .card__body {
    flex-direction: row;
  }

  .wrapper-content {
    width: 100%;

    .card__title {
      word-break: break-word;

      a {
        display: block;
      }
    }
  }

  .card__date {
    margin-right: 15px;
  }

  .card__title {
    margin-bottom: 10px;
    font-weight: 600;
  }

  .tag {
    font-size: 16px;
  }

  @media (max-width: ${mediaQueryMobile}) {
    .eventImage {
      height: 150px;
    }
  }
`;

export default EventPreviewContainer;
