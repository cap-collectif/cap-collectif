import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox';

type Props = {
    readonly size: number | string,
}

declare const SkeletonCircle: PolymorphicComponent<Props>;

export default SkeletonCircle;
