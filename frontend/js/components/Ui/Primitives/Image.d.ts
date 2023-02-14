import { AppBoxOwnProps, PolymorphicComponent } from './AppBox';

export type ImageProps = Omit<AppBoxOwnProps, 'src' | 'as'> &  {
    readonly src?: string

}

declare const Image: PolymorphicComponent<ImageProps>

export default Image
