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
  box-shadow: 1px 2px 2px 1px ${colors.lightGray};
  border-radius: 4px;
  overflow: hidden;

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

      svg {
        position: static;
        width: 100%;
        height: auto;
      }
    }

    .card__body {
      flex-direction: column;
      margin-left: 15px;
      padding: 0;
      flex: 1;
    }
  }

  &.eventPreview_list {
    .card__body {
      flex-direction: column;
      margin-left: 15px;
      padding: 0;
      flex: 1;
    }
  }

  .eventImage {
    overflow: hidden;
    max-height: 190px;
    height: 190px;
  }

  .card {
    height: 100%;
    margin: 0;
    border: ${props => (props.isHighlighted ? `1px solid ${colors.primaryColor}` : 'none')};
  }

  .card__body {
    flex-direction: row;
  }

  .card__date {
    margin-right: 15px;
  }

  .wrapper-content {
    width: 100%;

    .card__title {
      word-break: break-word;
      margin-bottom: 10px;
      font-weight: 600;

      a {
        display: block;
      }
    }
  }

  .tag {
    font-size: 16px;

    i {
      color: ${colors.darkGray};
    }
  }

  .tagUser a {
    font-weight: 600;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    &.eventPreview_list {
      .card__body {
        padding: 10px 0;
      }

      .card__date {
        margin: 0;
      }
    }

    &.isHorizontal {
      .eventImage {
        height: 83px;
        max-height: 83px;
        margin: 6px;
      }
    }

    .eventImage {
      height: 150px;
      max-height: 150px;
      border-radius: 4px;
    }
  }
`;

export default EventPreviewContainer;
