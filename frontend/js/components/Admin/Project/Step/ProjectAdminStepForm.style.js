// @flow
import styled, { type StyledComponent } from 'styled-components';

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
