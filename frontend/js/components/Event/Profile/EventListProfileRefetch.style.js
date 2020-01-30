// @flow
import styled, { type StyledComponent } from 'styled-components';
import { mediaQueryMobile } from '~/utils/sizes';
import colors from '~/utils/colors';

const EventListProfileRefetchContainer: StyledComponent<{}, {}, HTMLElement> = styled.section`
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
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 30px;
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
      flex-direction: column;

      .eventPreview {
        width: 100%;

        .eventImage {
          border-radius: 0;
        }
      }
    }
  }
`;

export default EventListProfileRefetchContainer;
