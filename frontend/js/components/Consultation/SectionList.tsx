import * as React from 'react'
import Section from './Section'
type Props = {
  // We have a recursive type…
  readonly section: {
    readonly sections:
      | ReadonlyArray<
          | {
              readonly sections:
                | ReadonlyArray<
                    | {
                        readonly sections:
                          | ReadonlyArray<
                              | {
                                  readonly sections:
                                    | ReadonlyArray<
                                        | {
                                            readonly sections:
                                              | ReadonlyArray<
                                                  | {
                                                      readonly $fragmentRefs: any
                                                    }
                                                  | null
                                                  | undefined
                                                >
                                              | null
                                              | undefined
                                            readonly $fragmentRefs: any
                                          }
                                        | null
                                        | undefined
                                      >
                                    | null
                                    | undefined
                                  readonly $fragmentRefs: any
                                }
                              | null
                              | undefined
                            >
                          | null
                          | undefined
                        readonly $fragmentRefs: any
                      }
                    | null
                    | undefined
                  >
                | null
                | undefined
              readonly $fragmentRefs: any
            }
          | null
          | undefined
        >
      | null
      | undefined
    readonly $fragmentRefs: any
  }
  readonly consultation: {}
  readonly level: number
  readonly hideEmptySection: boolean
}
export class SectionList extends React.Component<Props> {
  static defaultProps = {
    hideEmptySection: false,
  }

  render() {
    const { consultation, section, level, hideEmptySection } = this.props
    return (
      <div className="section-list_container">
        {/** @ts-ignore recursive type */}
        <Section consultation={consultation} section={section} level={level} hideEmptySection={hideEmptySection} />
        {section.sections &&
          section.sections.map((subSelection, index) => (
            <SectionList
              key={index}
              consultation={consultation} // @ts-expect-error $refType
              section={subSelection}
              level={level + 1}
            />
          ))}
      </div>
    )
  }
}
export default SectionList
