// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Box } from '@cap-collectif/ui';

export const ReplyFormContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background-color: #fff;
  padding: 15px;
  box-shadow: 0 0 3px 1px #ddd;
  border-radius: 4px;
`;

export const ParticipantEmailWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled(Box)`
  input {
    width: 300px;
  }
  @media (max-width: 768px) {
    input {
      width: 100%;
    }
  }
`;
