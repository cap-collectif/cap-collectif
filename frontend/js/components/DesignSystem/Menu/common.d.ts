import { ReactNode } from 'react';

export type RenderProps = (props: { readonly open: boolean }) => ReactNode

export type CommonProps = {
    readonly children: RenderProps | ReactNode
}
