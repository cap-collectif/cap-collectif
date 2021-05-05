import { ReactChild } from 'react';
import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox';

type Props = {
    readonly children: ReactChild
}

declare const ActionBar: PolymorphicComponent<Props>;

export default ActionBar;
