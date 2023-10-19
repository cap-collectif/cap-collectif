type Props = {
  readonly when: boolean
  readonly wrapper: (children: JSX.Element | JSX.Element[] | string) => React.ReactNode
  readonly children: JSX.Element | JSX.Element[] | string
}
export const ConditionalWrapper = ({ when, wrapper, children }: Props) => (when === true ? wrapper(children) : children)
export default ConditionalWrapper
