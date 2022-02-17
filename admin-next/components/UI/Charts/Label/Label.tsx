import { Flex, Box, Text, FlexProps } from '@cap-collectif/ui';

export interface LabelProps extends FlexProps {
    circleColor: string
    state: 'idle' | 'hidden'
}

const Label = ({ children, circleColor, state, ...props }: LabelProps) => (
    <Flex
        direction="row"
        spacing={2}
        align="center"
        opacity={state === 'hidden' ? 0.5 : 1}
        {...props}>
        <Box bg={circleColor} width={2} height={2} borderRadius="50%" flexShrink={0} />
        {typeof children === 'string' ? <Text color="gray.900">{children}</Text> : children}
    </Flex>
);

export default Label;
