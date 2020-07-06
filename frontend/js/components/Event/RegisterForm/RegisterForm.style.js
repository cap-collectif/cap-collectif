// @flow
import styled, { type StyledComponent } from 'styled-components';

export const FormContainer: StyledComponent<{}, {}, HTMLFormElement> = styled.form.attrs({
  className: 'register-form',
})`
  display: flex;
  flex-direction: column;
`;

export const UserInfo: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;
