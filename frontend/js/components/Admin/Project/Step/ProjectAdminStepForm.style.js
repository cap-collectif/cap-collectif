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
