import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox';

type Props = {
    readonly disabled?: boolean,
    readonly id: string,
}

declare const Item: PolymorphicComponent<Props>;

export default Item;
