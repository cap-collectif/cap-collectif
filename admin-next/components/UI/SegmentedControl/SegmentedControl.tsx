import { FC, useMemo } from 'react';
import { Flex, FlexProps } from '@cap-collectif/ui';
import SegmentedControlItem, { SegmentedControlValue } from './item/SegmentedControlItem';
import { SegmentedControlContext } from '@ui/SegmentedControl/SegmentedControl.context';

export interface SegmentedControlProps extends Omit<FlexProps, 'value' | 'onChange'> {
    value: SegmentedControlValue,
    onChange: (value: SegmentedControlValue) => void
}

type SubComponents = {
    Item: typeof SegmentedControlItem
}

const SegmentedControl: FC<SegmentedControlProps> & SubComponents = ({
    value,
    onChange,
    children,
    ...props  
}) => {
    const context = useMemo(
        () => ({
            onChange,
            value,
        }),
        [value, onChange],
    )

    return (
        <SegmentedControlContext.Provider value={context}>
            <Flex direction="row" justify="space-between" bg="gray.150" borderRadius="8px" p={2} {...props}>
                {children}
            </Flex>
        </SegmentedControlContext.Provider>
    )
}

SegmentedControl.Item = SegmentedControlItem;

export default SegmentedControl;
