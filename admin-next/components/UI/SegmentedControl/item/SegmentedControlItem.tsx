import type { FC } from 'react';
import { CapUIFontWeight, Box, BoxProps } from '@cap-collectif/ui';
import { useSegmentedControl } from '@ui/SegmentedControl/SegmentedControl.context';

export type SegmentedControlValue = string | number;

interface SegmentControlItemProps extends BoxProps {
    value: SegmentedControlValue
}

const SegmentedControlItem: FC<SegmentControlItemProps> = ({
    children,
    value,
    ...props
}) => {
    const { onChange, value: valueSelected } = useSegmentedControl();
    const selected = valueSelected === value;

    return (
        <Box
            as="button"
            type="button"
            color={selected ? "blue.800" : "gray.500"}
            bg={selected ? "white" : "none"}
            fontSize={3}
            fontWeight={selected ? CapUIFontWeight.Semibold : CapUIFontWeight.Normal}
            borderRadius="8px"
            minWidth="50px"
            textAlign="center"
            className="segmented-control__item"
            onClick={() => onChange(value)}
            p={2}
            {...props}>
            {children}
        </Box>
    )
}

export default SegmentedControlItem;