// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import { mediaQueryMobile } from '~/utils/sizes';
import { LIGHT_BOX_SHADOW, MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import Card from '~ui/Card/Card';

const EventPreviewContainer: StyledComponent<
  { isHighlighted?: boolean, isProject?: boolean },
  {},
  typeof Card,
> = styled(Card).attrs({
  className: 'eventPreview',
})`
  display: flex;
  flex-direction: row;
  height: 100%;
  margin: 0;
  overflow: hidden;
  ${MAIN_BORDER_RADIUS};
  padding: 15px;
  border: ${props =>
    props.isHighlighted ? `1px solid ${colors.primaryColor}` : `1px solid ${colors.borderColor}`};
  ${props =>
    props.isProject &&
    css`
      .date {
        margin-left: 5px;
      }
    `}

  &:hover {
    ${LIGHT_BOX_SHADOW};
  }

  .card__body {
    padding: 0;
    width: 100%;
    flex: 1;
  }

  .eventImage {
    width: 150px;
    max-width: 150px;
    min-width: 150px;
    min-height: 110px;
    height: 110px;
    aspect-ratio: 3 / 2;
    margin-right: 15px;
    flex: 1;
  }

  .past-container {
    margin-right: 8px;
  }

  .separator {
    margin-right: 5px;
  }

  a:hover {
    text-decoration: none;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;

    .eventImage {
      width: 100%;
      height: 150px;
      max-height: 150px;
      max-width: none;
      margin: 0 0 10px 0;

      svg {
        height: auto;
        width: 100%;
      }
    }
  }

  .cap-tag.eventTag {
    position: absolute !important;
    margin-top: 8px !important;
    margin-left: 8px !important;
    font-family: Roboto;
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0px;
    text-align: left;
    border-radius: 4px;
  }
`;

export const HeadContent: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;

  .inline-list {
    margin: 0;
  }
`;

export const Content: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 100%;
`;

export const TagsList: StyledComponent<{ vertical?: boolean }, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: ${props => (props.vertical ? 'column' : 'row')};
  align-items: ${props => (props.vertical ? 'flex-start' : 'center')};

  .tag {
    flex: 1;
    flex-basis: 50%;
    font-size: 16px;
    padding: 0;
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }

    i {
      color: ${colors.darkGray};
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const TitleContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 10px;
  font-weight: 600;

  .icon {
    margin-right: 5px;
    margin-top: 2px;
  }

  h3 {
    word-break: break-word;
    width: 100%;
  }

  a {
    display: block;
    width: 100%;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    align-items: flex-start;
  }
`;

export const DateContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export default EventPreviewContainer;
