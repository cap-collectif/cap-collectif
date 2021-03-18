import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox';

type Props = {
    readonly size: 'sm' | 'md' | 'lg',
}

declare const SkeletonText: PolymorphicComponent<Props>;

export default SkeletonText;
