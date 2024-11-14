import { RelatedContent } from './Post.type'
import { Option } from '@components/Projects/ProjectConfig/ProjectConfigForm.utils'

export const getTranslations = (locales, post) => {
  return locales.reduce((acc, locale) => {
    const trans = post?.translations?.find(translation => translation.locale === locale.code) || null
    const initialForLocal = {}

    if (trans) {
      initialForLocal[`${trans.locale}-title`] = trans.title
      initialForLocal[`${trans.locale}-body`] = trans.body
      initialForLocal[`${trans.locale}-abstract`] = trans.abstract
      initialForLocal[`${trans.locale}-meta_description`] = trans.metaDescription
    } else {
      initialForLocal[`${locale.code}-title`] = null
      initialForLocal[`${locale.code}-body`] = null
      initialForLocal[`${locale.code}-abstract`] = null
      initialForLocal[`${locale.code}-meta_description`] = null
    }
    return { ...acc, [`${locale.code}`]: initialForLocal }
  }, {})
}

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
