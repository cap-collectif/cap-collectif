import type { FC } from 'react';
import { Flex, FlexProps } from '@cap-collectif/ui';
import Title from './Title/Title';
import Description from './Description/Description';

export interface SectionProps extends FlexProps {}

type SubComponents = {
    Title: typeof Title,
    Description: typeof Description,
};

export const Section: FC<SectionProps> & SubComponents = ({ children, ...rest }) => (
    <Flex p={6} direction="column" bg="white" borderRadius="8px" {...rest}>
        {children}
    </Flex>
);

Section.Title = Title;
Section.Description = Description;

export default Section;
