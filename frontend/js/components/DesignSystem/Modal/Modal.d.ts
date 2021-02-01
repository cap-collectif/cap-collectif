import { FC, ReactElement, ReactNode } from "react";
import ModalBody from "./ModalBody";
import ModalHeader from "./ModalHeader";
import ModalFooter from "./ModalFooter";
import { AppBoxProps } from "../../Ui/Primitives/AppBox";
import { DialogProps } from "reakit";

type RenderProps = (props: Context) => ReactNode;

export type ModalProps = AppBoxProps &
    Pick<
        DialogProps,
        "hideOnClickOutside" | "hideOnEsc" | "preventBodyScroll"
        > & {
    readonly hideCloseButton?: boolean;
    readonly noBackdrop?: boolean;
    readonly scrollBehavior?: "inside" | "outside";
    readonly children: RenderProps | ReactNode;
    readonly ariaLabel: string;
    readonly onOpen?: () => void;
    readonly onClose?: () => void;
} & ({
    readonly disclosure?: never;
    readonly show: boolean;
} | {
    readonly disclosure: ReactElement;
    readonly show?: never;
});

declare const Modal: FC<ModalProps> & {
    Header: typeof ModalHeader;
    Body: typeof ModalBody;
    Footer: typeof ModalFooter;
};

export default Modal;
