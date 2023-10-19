export type Item = {
  readonly active: boolean
  readonly hasEnabledFeature: boolean
  readonly id: number
  readonly link: string
  readonly title: string
  readonly children: Item[]
}
