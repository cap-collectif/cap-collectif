// @flow
import * as React from 'react';
import type { Node } from 'react';
import { Container, TitleSubSection } from './Section.style';
import { TYPE_FORM } from '~/constants/FormConstants';
import TitleInvertContrast from '~ui/Typography/TitleInvertContrast';
import Description from '~ui/Form/Description/Description';
import withColors from '../../Utils/withColors';

type Props = {|
  children: Node | string,
  level: ?number,
  description?: ?string,
  typeForm?: $Values<typeof TYPE_FORM>,
  backgroundColor: string,
|};

const Section = ({ children, typeForm, level, description, backgroundColor }: Props) => (
  <Container className="form__section">
    {level === 0 ? (
      <TitleInvertContrast>{children}</TitleInvertContrast>
    ) : (
      <TitleSubSection primaryColor={backgroundColor}>{children}</TitleSubSection>
    )}

    {description && <Description typeForm={typeForm}>{description}</Description>}
  </Container>
);

export default withColors(Section);
