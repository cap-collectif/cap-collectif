import { RelatedContent } from './Post.type'
import { Option } from '@components/Projects/ProjectConfig/ProjectConfigForm.utils'

/**
 * @param array an array of objects
 * @returns an array of all truthy items in the provided array, or an empty array
 */
export const filterTruthyItems = (array: any[]) => array?.filter(item => !!item) || []

export const getSelectedOptions = (
  content: ReadonlyArray<RelatedContent>,
  target: 'Proposal' | 'Theme' | 'Project',
): Option[] => {
  return (
    filterTruthyItems(
      content?.map(obj =>
        obj.__typename === target
          ? {
              label: obj?.title,
              value: obj?.id ?? '',
            }
          : null,
      ),
    ) || []
  )
}
