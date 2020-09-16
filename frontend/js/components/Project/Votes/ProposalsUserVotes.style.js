// @flow
import styled, { type StyledComponent, css } from 'styled-components';
import colors from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import { bootstrapGrid } from '~/utils/sizes';

export const ProposalUserVoteStepContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-bottom: 30px;

  h2 {
    font-size: 26px;
  }

  h2 + div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  h2 + div button {
    font-size: 14px;
    font-weight: 600;
    background: none;
    border: none;
    outline: none;
  }
`;

export const TitleContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background-color: ${colors.pageBgc};
  padding: 45px 0;
  text-align: center;
  font-size: 33px;
  font-weight: 600;
  border: 1px solid ${colors.borderColor};
`;

export const BackToVote: StyledComponent<{}, {}, HTMLAnchorElement> = styled.a`
  font-size: 16px;
  font-weight: 600;
`;

export const VoteItemContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;

  .proposals-user-votes__title {
    font-weight: 600;
  }

  @media (max-width: ${bootstrapGrid.xsMax}px) {
    position: relative;
    flex-direction: column;
    > div {
      margin-bottom: 10px;
    }

    .proposal-vote__delete-container {
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 0;
      margin-bottom: 0 !important;
    }
  }

  .form-group {
    margin-bottom: 0;
  }
`;

export const ButtonDeleteVote: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: rgba(220, 53, 69, 0.2);
  width: 30px;
  height: 30px;
  border-radius: 15px;
`;

export const VoteMinAlertContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;

  svg {
    margin-right: 25px;
  }

  div > div:first-child span {
    font-size: 18px;
    font-weight: 600;
    color: #4c4c4c;
  }
  div > div:nth-child(2) span {
    font-size: 15px;
    color: #606060;
  }

  h4 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
  }
`;

export const NonDraggableItemContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  border-radius: 4px;
  border: 1px solid ${colors.borderColor};
  margin-bottom: 10px;
  padding: 15px 20px;
  background: ${colors.formBgc};
`;

export const VotePlaceholder: StyledComponent<
  { isDraggable: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  ${props =>
    props.isDraggable &&
    css`
      display: flex;
      margin-top: 10px;
    `}

  div {
    width: 100%;
    height: 45px;
    border: 1px solid ${colors.borderColor};
    border-style: dashed;
    ${MAIN_BORDER_RADIUS};
    ${props =>
      !props.isDraggable &&
      css`
        margin-bottom: 10px;
      `}
  }
`;

export const ItemPosition: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  width: 30px;
  height: 23px;
  line-height: 23px;
  margin-top: 10px;
  margin-right: 20px;
  text-align: center;
  background-color: ${colors.primaryColor};
  color: ${colors.white};
  border-radius: 20px;
`;
