import type { FC } from 'react';
import { Flex, FlexProps } from '@cap-collectif/ui';
import Title from './Title/Title';
import Count from './Count/Count';
import cn from 'classnames';

export type VariantType = 'blue' | 'white' | 'red' | 'yellow';

export interface CountSectionProps extends FlexProps {
    variant?: VariantType
}

type SubComponents = {
    Title: typeof Title,
    Count: typeof Count,
};

const variantStyle = {
    white: {
        bg: 'white',
        border: 'none',
        '.count-section__title, .count-section__count': {
            color: 'blue.800'
        }
    },
    blue: {
        bg: 'blue.100',
        border: "normal",
        borderColor: 'blue.150',
        '.count-section__title, .count-section__count': {
            color: 'blue.800'
        }
    },
    red: {
        bg: 'red.100',
        border: "normal",
        borderColor: 'red.150',
        '.count-section__title, .count-section__count': {
            color: 'red.800'
        }
    },
    yellow: {
        bg: 'yellow.100',
        border: "normal",
        borderColor: 'yellow.200',
        '.count-section__title, .count-section__count': {
            color: 'yellow.800'
        }
    },
}

export const CountSection: FC<CountSectionProps> & SubComponents = ({ children, className, variant = 'blue', ...rest }) => (
    <Flex
        px={6}
        py={4}
        width="100%"
        direction="column"
        borderRadius="8px"
        spacing={2}
        className={cn('count-section', className)}
        sx={variantStyle[variant]}
        {...rest}>
        {children}
    </Flex>
);

CountSection.Title = Title;
CountSection.Count = Count;

export default CountSection;
