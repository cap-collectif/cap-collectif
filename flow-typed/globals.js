declare var __SERVER__: boolean;
declare var __DEV__: boolean;

type _ArrayElement<El, Arr: $ReadOnlyArray<El>> = El;
type $ArrayElement<Arr> = _ArrayElement<*, Arr>;
