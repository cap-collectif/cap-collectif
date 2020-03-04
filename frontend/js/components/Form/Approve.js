// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';

type Props = {|
  input: {
    onChange: Function,
    value: string,
  },
  approvedValue: string,
  refusedValue: string,
  disabled: boolean,
|};

const Approve: StyledComponent<{ active: boolean }, {}, HTMLButtonElement> = styled.button`
  height: 35px;
  min-width: 135px;
  border-radius: 4px 0 0 4px;
  border: 1px solid rgb(0, 138, 25);
  color: #008a19;
  background: ${({ active }) => active && 'rgba(6, 138, 32, 0.12)'};
  font-weight: ${({ active }) => active && '600'};
`;

const Refuse: StyledComponent<{ active: boolean }, {}, HTMLButtonElement> = styled.button`
  height: 35px;
  min-width: 135px;
  border-radius: 0 4px 4px 0;
  border: 1px solid rgb(220, 53, 69);
  color: #dd3c4c;
  background: ${({ active }) => active && 'rgba(221, 60, 76, 0.12)'};
  font-weight: ${({ active }) => active && '600'};
`;

export const ApproveComponent = ({ input, approvedValue, refusedValue, disabled }: Props) => (
  <div className="form-group d-flex">
    <Approve
      type="button"
      id="approved_button"
      active={input.value === approvedValue}
      disabled={disabled}
      onClick={() => input.onChange(approvedValue)}>
      <FormattedMessage id="admin.action.recent_contributions.validate.button" />
    </Approve>
    <Refuse
      type="button"
      id="refused_button"
      active={input.value === refusedValue}
      disabled={disabled}
      onClick={() => input.onChange(refusedValue)}>
      <FormattedMessage id="btn_preview_decline" />
    </Refuse>
  </div>
);

export default ApproveComponent;
