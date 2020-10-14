// @flow
import * as React from 'react';
import cn from 'classnames';
import { Container, InstructionContainer, IconContainer } from './ParticipationTutorial.style';
import Icon from '~ui/Icons/Icon';

type Instruction = {|
  mainText: string,
  secondText: string,
  icon: {
    primaryColor: string,
    secondaryColor: string,
    iconName: string,
  },
|};

export type Props = {
  instructions: Instruction[],
  className?: string,
};

const ParticipationTutorial = ({ instructions, className }: Props) => (
  <Container className={cn('participate-tutorial', className)}>
    {instructions.map((instruction, idx) => (
      <InstructionContainer key={idx}>
        <IconContainer backgroundColor={instruction.icon.secondaryColor}>
          <Icon name={instruction.icon.iconName} color={instruction.icon.primaryColor} size={30} />
        </IconContainer>

        <div className="text-container">
          <p className="main-text">{instruction.mainText}</p>
          {instruction.secondText && <p className="second-text">{instruction.secondText}</p>}
        </div>
      </InstructionContainer>
    ))}
  </Container>
);

export default ParticipationTutorial;
