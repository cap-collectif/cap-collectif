// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { hexToRgba } from '~/utils/colors/hexToRgb';
import isQuestionnaire from '~/utils/isQuestionnaire';
import Description from '~ui/Form/Description/Description';
import { TYPE_FORM } from '~/constants/FormConstants';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import withColors from '~/components/Utils/withColors';

const DescriptionSubSectionQuestionnaire: StyledComponent<
  { primaryColor: string },
  {},
  HTMLDivElement,
> = styled.div`
  font-size: 14px;
  background-color: ${props =>
    props.primaryColor ? hexToRgba(props.primaryColor, 0.03, true) : hexToRgba('#fff', 0.03, true)};
  border: 1px solid
    ${props =>
      props.primaryColor
        ? hexToRgba(props.primaryColor, 0.08, true)
        : hexToRgba('#fff', 0.08, true)};
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 32px;
  margin-left: 32px;
  margin-right: 32px;
`;

type SectionSubDescriptionProps = {
  children: string,
  typeForm?: $Values<typeof TYPE_FORM>,
  backgroundColor: string,
};

const SubSectionDescription = ({
  children,
  typeForm,
  backgroundColor,
}: SectionSubDescriptionProps) => {
  return isQuestionnaire(typeForm) ? (
    <DescriptionSubSectionQuestionnaire primaryColor={backgroundColor}>
      <WYSIWYGRender value={children} />
    </DescriptionSubSectionQuestionnaire>
  ) : (
    <Description>
      <WYSIWYGRender value={children} />
    </Description>
  );
};

export default withColors(SubSectionDescription);
