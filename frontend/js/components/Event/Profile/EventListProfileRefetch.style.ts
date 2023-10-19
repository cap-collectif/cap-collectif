import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { mediaQueryMobile } from '~/utils/sizes'
import colors from '~/utils/colors'

const EventListProfileRefetchContainer: StyledComponent<any, {}, HTMLElement> = styled.section`
  header {
    display: flex;
    justify-content: space-between;

    .wrapper-select {
      position: relative;
      align-self: flex-end;

      .form-group {
        margin: 0;
      }

      select {
        height: 100%;
        align-self: flex-end;
        padding: 3px 22px 3px 5px;
        appearance: none;

        & ::-ms-expand {
          display: none;
        }
      }

      svg {
        display: block;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);

        path {
          fill: ${colors.darkGray};
        }
      }
    }
  }

  .event_container {
    padding-top: 20px;
    width: 100%;
    margin-bottom: 30px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: auto;
    grid-auto-columns: 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;

    @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;

      .eventPreview {
        width: 49%;
        margin-bottom: 20px;
      }
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    header {
      display: inline-flex;
      flex-direction: column;

      .wrapper-select {
        align-self: flex-start;
      }
    }

    .event_container {
      display: flex;
      flex-direction: column;

      @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
        .eventPreview {
          width: 100%;
        }
      }

      .eventPreview {
        margin: 0 0 20px 0;

        .eventImage {
          border-radius: 0;
        }
      }
    }
  }
`
export default EventListProfileRefetchContainer
