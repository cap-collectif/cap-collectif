// @flow
import React from 'react';
import Icon from '~ds/Icon/Icon';
import { Container } from './VoteView.style';

type Props = {|
  +positivePercentage: number,
|};

export const VoteView = ({ positivePercentage }: Props) => {
  if (positivePercentage < 0 || positivePercentage > 100) return null;
  const left = positivePercentage;
  const right = 100 - positivePercentage;
  return (
    <Container left={left} right={right} key={positivePercentage}>
      <div>
        {left > 5 ? (
          <div>
            <div className="circle">
              <Icon name="THUMB_UP" color="white" size="lg" />
            </div>
            {[...Array(Math.floor(left / 20) + (left > 10 ? 1 : 0))].map((_, index) => (
              <div className="bubble" key={`${index}-green`}>
                <Icon name="THUMB_UP" color="white" size="lg" />
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ opacity: right > 5 ? 1 : 0 }}>
          <div className="circle red">
            <Icon name="THUMB_UP" color="white" size="lg" />
          </div>
          {[...Array(Math.floor(right / 20) + (right > 10 ? 1 : 0))].map((_, index) => (
            <div className="bubble reverse" key={`${index}-red`}>
              <Icon name="THUMB_UP" color="white" size="lg" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <span>
          <span className="progressBar" />
        </span>
        <span>
          <span className="progressBar red" />
        </span>
      </div>
      <div>
        {left ? <span>{`${Math.round(left * 100) / 100}%`}</span> : null}
        {right ? <span>{`${right === 100 ? 0 : Math.round(right * 100) / 100}%`}</span> : null}
      </div>
    </Container>
  );
};

export default VoteView;
