import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox';

type Props = {
    readonly value?: string | null,
    readonly onChange?: (value: string) => void,
}

declare const InlineSelect: PolymorphicComponent<Props>;

export default InlineSelect;
