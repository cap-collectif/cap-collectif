// @flow
import styled from 'styled-components';
import colors from '../../../utils/colors';

export const CardContainer = styled.div`
  border: 1px solid ${colors.borderColor};
  background-color: ${colors.white};
  margin-bottom: 30px;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  width: 100%;
  border-radius: 4px;

  .small {
    font-size: 14px;
  }

  ul {
    margin-bottom: 5px;

    a {
      color: ${colors.darkGray};
    }
  }

  .card__threshold .progress {
    margin-bottom: 0;
  }

  .card__title {
    font-size: 18px;
    line-height: 1.2;
    margin: 0 0 10px;
  }

  .card__body {
    display: flex;
    padding: 15px;
    flex: 1 0 auto;
    flex-direction: column;

    &__infos {
      flex: 1 0 auto;
      word-wrap: break-word;
    }
  }

  button {
    margin-top: 15px;
  }

  .ql-toolbar button {
    margin-top: 0;
  }

  .card__actions {
    color: ${colors.darkGray};
    font-size: 14px;

    a {
      text-transform: uppercase;
      margin-right: 10px;
    }
  }

  .card__counters {
    padding: 5px;
    background-color: ${colors.pageBgc};
    border-top: 1px solid ${colors.borderColor};
    font-size: 14px;
    text-align: center;

    &_multiple .card__counter {
      width: 50%;

      &:nth-child(2) {
        border-left: 1px solid ${colors.borderColor};
      }
    }

    .card__counter {
      display: inline-block;

      &__value {
        font-size: 18px;
      }
    }
  }

  @media print {
    border: none;
    display: block;
    margin-bottom: 0;
    margin-top: 15pt;

    .card__body {
      display: block;
      padding: 0;
    }
  }
`;
