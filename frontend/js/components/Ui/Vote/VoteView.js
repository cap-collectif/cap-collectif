// @flow
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import Icon from '~ds/Icon/Icon';
import { Container } from './VoteView.style';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';
import Text from '~ui/Primitives/Text';

type Props = {|
  +positivePercentage: number,
  +isMobile?: boolean,
  +votesCount: ?{|
    +FOR: number,
    +AGAINST: number,
  |},
|};

const MobileTextPercentage = styled(Text).attrs({
  uppercase: true,
  fontSize: 1,
  lineHeight: 's',
  fontWeight: 700,
  mt: 1,
})``;

export const VoteView = ({ positivePercentage, isMobile, votesCount }: Props) => {
  const intl = useIntl();
  const positivePercentageCleaned = Number.isNaN(positivePercentage) ? 0 : positivePercentage;

  if (positivePercentageCleaned < 0 || positivePercentageCleaned > 100) return null;

  const left = positivePercentageCleaned;
  const right = 100 - positivePercentageCleaned;
  const leftPercentage = `${Math.round(left * 100) / 100}%`;
  const rightPercentage = `${Math.round(right * 100) / 100}%`;

  if (isMobile) {
    return (
      <Flex width="100%" position="relative" justify="space-between">
        <MobileTextPercentage color="green.500">
          {votesCount ? votesCount.FOR : leftPercentage}&nbsp;
          <FormattedMessage id="argument.show.type.for" tagName={React.Fragment} />
        </MobileTextPercentage>
        <AppBox
          flex={Math.floor(left)}
          bg="green.500"
          position="absolute"
          left={0}
          height="2px"
          width={leftPercentage}
        />
        <MobileTextPercentage color="red.500">
          {votesCount ? votesCount.AGAINST : rightPercentage}&nbsp;
          <FormattedMessage id="argument.show.type.against" tagName={React.Fragment} />
        </MobileTextPercentage>
        <AppBox
          flex={Math.floor(right)}
          bg="red.500"
          position="absolute"
          height="2px"
          left={leftPercentage}
          width={rightPercentage}
        />
      </Flex>
    );
  }

  return (
    <Container left={left} right={right} key={positivePercentageCleaned}>
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
        {left ? (
          <Text as="span" color="neutral-gray.900" fontWeight="semibold" className="for-percentage">
            {votesCount ? (
              <Text as="span">
                {`${votesCount.FOR} ${intl
                  .formatMessage({ id: 'argument.show.type.for' })
                  .toLowerCase()}`}
              </Text>
            ) : (
              leftPercentage
            )}
          </Text>
        ) : null}

        {right ? (
          <Text
            as="span"
            color="neutral-gray.900"
            fontWeight="semibold"
            className="against-percentage">
            {votesCount ? (
              <Text as="span">
                {`${votesCount.AGAINST} ${intl
                  .formatMessage({
                    id: 'argument.show.type.against',
                  })
                  .toLowerCase()}`}
              </Text>
            ) : (
              rightPercentage
            )}
          </Text>
        ) : null}
      </div>
    </Container>
  );
};

export default VoteView;
