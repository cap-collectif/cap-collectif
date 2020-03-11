// @flow
import * as React from 'react';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import DescriptionContainer from './Description.style';
import ButtonBody from '~/components/Reply/Form/ButtonBody';
import { TYPE_FORM } from '~/constants/FormConstants';
import isQuestionnaire from '~/utils/isQuestionnaire';

type Props = {
  children: React.Node | string,
  typeForm?: $Values<typeof TYPE_FORM>,
};

const Description = ({ children, typeForm }: Props) =>
  isQuestionnaire(typeForm) ? (
    <DescriptionContainer>
      {typeof children === 'string' ? <WYSIWYGRender value={children} /> : children}
    </DescriptionContainer>
  ) : (
    <ButtonBody body={typeof children === 'string' ? children : ''} />
  );

export default Description;
