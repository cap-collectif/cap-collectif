// @flow
import * as React from 'react';

export type Step = {|
  +id: string,
  +validationLabel: string,
  +label?: string,
|};

export type Context = {|
  +currentStep: number,
  +setCurrentStep: (stepIndex: number) => void,
  +steps: Step[],
  +registerSteps: (steps: Step[]) => void,
|};

export const ModalStepsContext = React.createContext<Context>({
  currentStep: 0,
  setCurrentStep: () => {},
  steps: [],
  registerSteps: () => {},
});

export const useModalSteps = (): Context => {
  const context = React.useContext(ModalStepsContext);
  if (!context) {
    throw new Error(`You can't use the ModalStepsContext outsides a ModalSteps component.`);
  }
  return context;
};
