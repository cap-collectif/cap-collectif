// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { TYPE_FORM } from '~/constants/FormConstants';
import isQuestionnaire from '~/utils/isQuestionnaire';
import Description from '~ui/Form/Description/Description';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';

const DescriptionSectionQuestionnaire: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  font-size: 14px;
  margin-bottom: 32px;
  margin-left: 32px;
  margin-right: 32px;
`;

type SectionDescriptionProps = {
  children: string,
  typeForm?: $Values<typeof TYPE_FORM>,
};

const SectionDescription = ({ children, typeForm }: SectionDescriptionProps) =>
  isQuestionnaire(typeForm) ? (
    <DescriptionSectionQuestionnaire>
      <WYSIWYGRender value={children} />
    </DescriptionSectionQuestionnaire>
  ) : (
    <Description>
      <WYSIWYGRender value={children} />
    </Description>
  );

export default SectionDescription;
