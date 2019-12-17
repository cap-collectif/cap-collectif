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
  font-family: 'OpenSans', helvetica, arial, sans-serif;
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
  }

  &.eventPreview_list {
    .card__body {
      flex-direction: column;
      margin-left: 15px;
      padding: 0;
      flex: 1;
    }
  }

  .card {
    height: 100%;
    margin: 0;
    border: ${props => props.isHighlighted && `1px solid ${colors.primaryColor}`};
  }

  .card__body {
    flex-direction: row;
  }

  .card__date {
    margin-right: 15px;
  }

  .eventImage {
    height: 190px;
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

  @media (max-width: ${mediaQueryMobile}) {
    .eventImage {
      height: auto;
      max-height: 83px;
      border-radius: 4px;
      overflow: hidden;
      margin: 6px;

      svg {
        width: 100%;
        height: 100%;
      }
    }
  }
`;

export default EventPreviewContainer;
