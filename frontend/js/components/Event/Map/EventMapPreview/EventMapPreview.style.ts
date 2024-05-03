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

  .eventPreviewTagsList {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .tagUser {
      padding: 0;

      .customImage {
        min-width: 18px;
        width: 18px;
        margin-right: 8px;
      }
    }

    & > *,
    & > .tagUser:first-child {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      margin: 0;
      padding: 0;
      gap: 8px;

      .userTagContainer {
        margin: 0;
        padding: 0;
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;

        a {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        & > span {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          margin: 0 8px 0 0;
        }

        .icon-rounded {
          margin: 0 8px 0 0;
          min-width: 18px;
          width: 18px;
        }
      }

      .cityTagContainer .icon-rounded {
        margin: 0 8px 0 0;
      }

      .cityTagContainer {
        .tag {
          padding: 0;
        }
      }
    }
  }

  .tag {
    i {
      color: ${colors.darkGray};
    }
  }
`
export default EventMapPreviewContainer
