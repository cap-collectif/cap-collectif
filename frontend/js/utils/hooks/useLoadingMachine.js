// @flow
import { useCallback, useState } from 'react';

type State = {| +status: 'idle' | 'loading' | 'error', +errorMessage: ?string |};

type Return = {|
  +isLoading: boolean,
  +hasError: boolean,
  +errorMessage: ?string,
  +startLoading: () => void,
  +stopLoading: () => void,
  +triggerError: (errorMessage: string) => void,
|};

const useLoadingMachine = (): Return => {
  const [state, setState] = useState<State>({ status: 'idle', errorMessage: null });

  const startLoading = useCallback(() => {
    setState({ status: 'loading', errorMessage: null });
  }, []);

  const stopLoading = useCallback(() => {
    setState({ status: 'idle', errorMessage: null });
  }, []);

  const triggerError = (errorMessage: string) => {
    setState({ status: 'error', errorMessage });
  };

  const isLoading = state.status === 'loading';
  const hasError = state.status === 'error';

  return {
    errorMessage: state.errorMessage,
    hasError,
    isLoading,
    startLoading,
    stopLoading,
    triggerError,
  };
};

export default useLoadingMachine;
