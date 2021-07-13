import { FC } from "react";
import { ModalProps } from '../Modal/Modal';

type ModalStepsProps = ModalProps & Readonly<{
    defaultStepId?: string,
    resetStepOnClose?: boolean,
}>;

declare const ModalSteps: FC<ModalStepsProps> & {
    Header: typeof ModalStepsHeader;
    ProgressBar: typeof ModalStepsProgressBar;
    Body: typeof ModalStepsBody;
    Footer: typeof ModalStepsFooter;
};

export default ModalSteps;
