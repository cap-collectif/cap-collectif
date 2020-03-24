// @flow
import styled, { type StyledComponent } from 'styled-components';
import { ListGroupItem } from 'react-bootstrap';
import colors from '~/utils/colors';

export const DateContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  width: auto;
  flex-direction: row;

  @media screen and (max-width: 500px) {
    flex-direction: column;
  }

  > div {
    margin-right: 2%;
  }

  .form-fields.input-group {
    max-width: 238px;
  }
`;

export const FormContainer: StyledComponent<{}, {}, HTMLFormElement> = styled.form`
  .react-select__menu {
    z-index: 3;
  }

  input[name='label'] {
    max-width: 50%;
  }
`;

export const CustomCodeArea: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  textarea {
    max-height: 90px;
  }
`;

export const RequirementDragItem: StyledComponent<{}, {}, typeof ListGroupItem> = styled(
  ListGroupItem,
)`
  display: flex;
  align-items: center;
  background: ${colors.formBgc};

  i.cap-android-menu {
    color: #aaa;
    font-size: 20px;
    margin-right: 10px;
  }

  .form-group {
    margin-bottom: 0;
  }

  li {
    margin-right: 15px;
  }
`;

export const CheckboxPlaceholder: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  flex: none;
  width: 23px;
  height: 23px;
  border-radius: 4px;
  background: ${colors.iconGrayColor};
  opacity: 0.5;
  margin-right: 15px;
  padding: 2px 5px;
  color: ${colors.formBgc};
`;

export const VoteFieldContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  div + span {
    font-weight: bold;
  }
  input[type='number'] {
    max-width: 200px;
  }
`;

export const PrivacyContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  > span {
    font-weight: bold;
  }

  button {
    margin-top: 15px;
  }
`;

export const PrivacyInfo: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;

  span {
    margin-left: 5px;
  }

  span:first-child {
    margin-left: 0;
    font-weight: bold;
  }
`;
