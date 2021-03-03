// @flow
declare module "use-analytics" {
  declare export function useAnalytics(): {
    track: (event: string, parameters?: string | Object) => void,
    page: () => void,
    identify: (user: string, parameters?: string | Object) => void,
  };

  declare export class AnalyticsProvider extends React$Component<
    {
      children?: React$Node,
    }
    > {}
}
