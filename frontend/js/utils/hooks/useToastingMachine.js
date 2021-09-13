// @flow
import { useCallback, useState } from 'react';

type State = {| +status: 'idle' | 'toasting' | 'error', +errorMessage: ?string |};

type Return = {|
  +isToasting: boolean,
  +hasError: boolean,
  +errorMessage: ?string,
  +startToasting: () => void,
  +stopToasting: () => void,
  +triggerError: (errorMessage: string) => void,
|};

const useToastingMachine = (): Return => {
  const [state, setState] = useState<State>({ status: 'idle', errorMessage: null });

  const startToasting = useCallback(() => {
    setState({ status: 'toasting', errorMessage: null });
  }, []);

  const stopToasting = useCallback(() => {
    setState({ status: 'idle', errorMessage: null });
  }, []);

  const triggerError = (errorMessage: string) => {
    setState({ status: 'error', errorMessage });
  };

  const isToasting = state.status === 'toasting';
  const hasError = state.status === 'error';

  return {
    errorMessage: state.errorMessage,
    hasError,
    isToasting,
    startToasting,
    stopToasting,
    triggerError,
  };
};

export default useToastingMachine;
