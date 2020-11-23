// @flow
import React from 'react';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
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
              <Icon name={ICON_NAME.thumbO} size={30} color={colors.white} />
            </div>
            {[...Array(Math.floor(left / 20) + (left > 10 ? 1 : 0))].map(() => (
              <div className="bubble">
                <Icon name={ICON_NAME.thumbO} size={30} color={colors.white} />
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ opacity: right > 5 ? 1 : 0 }}>
          <div className="circle red">
            <Icon name={ICON_NAME.thumbO} size={30} color={colors.white} />
          </div>
          {[...Array(Math.floor(right / 20) + (right > 10 ? 1 : 0))].map(() => (
            <div className="bubble reverse">
              <Icon name={ICON_NAME.thumbO} size={30} color={colors.white} />
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
        {left ? <span>{`${left}%`}</span> : null}
        {right ? <span>{`${right === 100 ? 0 : right}%`}</span> : null}
      </div>
    </Container>
  );
};

export default VoteView;
