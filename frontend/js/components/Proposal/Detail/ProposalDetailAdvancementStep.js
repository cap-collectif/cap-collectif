// @flow
import React from 'react';
import moment from 'moment';
import { Label } from 'react-bootstrap';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import type { GlobalState } from '~/types';

type Props = {
  step: Object,
  roundColor: string,
  status?: ?Object,
  borderColor?: ?string,
  children?: $FlowFixMe,
};

const ProposalDetailAdvancementStep = ({
  borderColor,
  roundColor,
  step,
  status,
  children,
}: Props) => {
  const { bgColor } = useSelector((state: GlobalState) => ({
    bgColor: state.default.parameters['color.btn.primary.bg'],
  }));

  const renderDate = () => {
    if (step.timeless && !step.endAt && !step.startAt) {
      return <FormattedMessage id="proposal.detail.intervals.continuously" />;
    }

    if (!step.endAt) {
      return (
        <FormattedDate
          value={moment(step.startAt)}
          day="numeric"
          month="short"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      );
    }

    return (
      <>
        <FormattedDate value={moment(step.startAt)} day="numeric" month="short" year="numeric" />
        &nbsp;-&nbsp;
        <FormattedDate value={moment(step.endAt)} day="numeric" month="short" year="numeric" />
      </>
    );
  };

  return (
    <span>
      <div
        style={
          borderColor
            ? {
                paddingTop: '10px',
                paddingBottom: '10px',
                borderLeftStyle: 'solid',
                borderLeftColor: borderColor,
                borderLeftWidth: '4px',
                paddingLeft: '8px',
                marginLeft: '5px',
              }
            : {
                paddingTop: '5px',
                paddingLeft: '8px',
                marginLeft: '9px',
              }
        }>
        <div
          style={{
            float: 'left',
            width: '16px',
            height: '16px',
            marginTop: '-10px',
            marginLeft: '-18px',
            lineHeight: '28px',
            color: '#767676',
            textAlign: 'center',
            backgroundColor: roundColor || bgColor,
            borderRadius: '50%',
          }}
        />
        <div style={{ marginTop: '-15px', marginLeft: '15px' }}>
          <div>{step.title}</div>
          <div className="excerpt small">
            <span>{renderDate()}</span>
          </div>
          {status && (
            <Label
              css={{
                marginTop: '5px',
                borderRadius: '15px',
                background: `${roundColor || bgColor} !important`,
              }}>
              {status.name.length > 25 ? `${status.name.substr(0, 25)}...` : status.name}
            </Label>
          )}
        </div>
        <br />
      </div>
      {children}
    </span>
  );
};

export default ProposalDetailAdvancementStep;
