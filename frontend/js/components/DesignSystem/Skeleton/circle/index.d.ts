import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox';

type Props = {
    readonly size: number | string,
    readonly animate?: boolean,
}

declare const SkeletonCircle: PolymorphicComponent<Props>;

export default SkeletonCircle;
