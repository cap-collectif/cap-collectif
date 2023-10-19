// @ts-nocheck
/* eslint-disable no-case-declarations */
import { Map, OrderedSet } from 'immutable'
import { camelCase, isEmpty, isNil, kebabCase } from 'lodash'
import { IFRAME, IMAGE, HR, LINK, COLORS, FONTS, FONT_SIZES } from '../renderer/constants'
import type { DraftEditorState, DraftContentBlock, DraftEntity } from '../models/types'

function convertStyleStringToObject(style: string = '', data = {}) {
  if (!style) {
    return null
  }

  return style
    .split(';')
    .filter(s => s.includes(':'))
    .map(s => s.split(':'))
    .reduce((map, s) => {
      const key = s.shift().trim()
      const val = s.join(':').trim()
      map[key] = val
      return map
    }, data)
}

export const customStyleMap = (() => {
  const styleMap = {
    STRIKETHROUGH: {
      textDecoration: 'line-through',
    },
  }
  ;['backgroundColor', 'color'].forEach(style => {
    COLORS.forEach(color => {
      styleMap[`${style}.${color}`] = {
        [style]: color,
      }
    })
  })
  FONTS.forEach(font => {
    styleMap[`fontFamily.${font}`] = {
      fontFamily: font,
    }
  })
  FONT_SIZES.forEach(size => {
    styleMap[`fontSize.${size}`] = {
      fontSize: `${size}pt`,
    }
  })
  return styleMap
})()
// this is for handling styles not matched by the defaultStyleMap or customStyleMap
export const customStyleFn = (style: Record<string, any>) => {
  // "style" is an Immutable.js OrderedSet of inline styles for a given range of characters that share the same styling
  // exclude styles matched by the defaut or customStyleMap
  style = style.subtract(['BOLD', 'CODE', 'ITALIC', 'UNDERLINE']).filter(v => isNil(customStyleMap[v]))
  // separate out any entries that are a string of multiple styles
  let groupedStyles = style.filter(v => v.includes(';'))
  style = style.subtract(groupedStyles)
  // convert string containing multiple styles to a CSS styles object
  groupedStyles = groupedStyles.reduce((map, v: any) => {
    v = convertStyleStringToObject(v)
    v = Map(v as any).mapKeys(k => camelCase(k))
    return map.merge(v)
  }, Map())
  // convert style strings with single style to CSS styles objects and merge with groupedStyles
  style = style
    .map(v => v.split('.'))
    .filter(v => v.every(vv => vv.length))
    .reduce((map, v) => {
      const key = v.shift().trim()
      const val = v.join('.').trim()
      return map.merge({
        [key]: val,
      })
    }, groupedStyles)
    .toJS()

  if (isEmpty(style)) {
    return null
  }

  return style
}

function buildHtmlForBlockText(result, block, contentState) {
  if (!block) {
    return '<span>&nbsp;</span>'
  }

  // now build the html for all inline styles for each "styleRange" in the block. A styleRange is
  // any sequence in the block where the characters share the same inline styling.
  block.findStyleRanges(
    () => true,
    (s, e) => {
      let close = ''
      let styles = block.getInlineStyleAt(s)
      // separate out styles handled by the default or customStyleMap so they aren't lost in the customStyleFn
      let defaultStyles = styles.intersect(['BOLD', 'CODE', 'ITALIC', 'UNDERLINE'])
      defaultStyles = defaultStyles.union(styles.filter(v => !isNil(customStyleMap[v])))
      // the remaining styles can be processed by customStyleFn
      // @ts-expect-error wip
      styles = Map(customStyleFn(styles)).reduce((set, v, k) => {
        return set.add(`${k}${v ? `.${v}` : ''}`)
      }, new OrderedSet())
      // now recombine the default and custom styles
      styles = defaultStyles.union(styles)
      // If a styleRange overlaps with an "entity" that starts and ends at the same points in the block
      // the entity represents an embeded link
      const startKey = block.getEntityAt(s)
      const endKey = block.getEntityAt(e - 1)
      const entity = startKey && startKey === endKey ? contentState.getEntity(startKey) : null
      styles.forEach(style => {
        switch (style.split('.')[0]) {
          case 'ITALIC':
            result += '<em>'
            close = `</em>${close}`
            break

          case 'BOLD':
            result += '<strong>'
            close = `</strong>${close}`
            break

          case 'UNDERLINE':
            result += "<u style='text-decoration: underline'>"
            close = `</u>${close}`
            break

          default:
            const arr = style.split('.')
            const key = kebabCase(arr.shift())
            let val = arr.join('.')

            if (key === 'font-size' && /^\d*$/.test(val)) {
              val += 'pt'
            }

            result += `<span style='${key}:${val}'>`
            close = `</span>${close}`
        }
      })
      // Now add the text content of the block for the current styleRange. If a "link" entity exists for this range
      // then wrap the text content in an anchor tag and add the href.
      // The multiple "replace" calls prevent empty paragraphs and extra spaces from collapsing and failing to render.
      const textContent = block
        .getText()
        .slice(s, e)
        .replace(/\n/g, '<br>')
        .replace(/\s{2,}?/g, '&nbsp;&nbsp;')
        .replace(/^\s$/g, '&nbsp;')

      if (entity && entity.get('type') === 'LINK') {
        const { url } = entity.getData()
        result += `<a href='${url}'>${textContent}</a>`
      } else {
        result += textContent
      }

      result += close
    },
  )
  return result
}

export default (currentContent: DraftEditorState) => ({
  inlineStyleFn: (styles: Record<string, any>) => {
    const colorKey = 'color-'
    const bgColorKey = 'bg-'
    const color = styles.filter((value: Record<string, any>) => value.startsWith(colorKey)).first()
    const bgColor = styles.filter((value: Record<string, any>) => value.startsWith(bgColorKey)).first()
    let style = {}

    if (color) {
      style = {
        style: {
          color: color.replace(colorKey, ''),
        },
      }
    }

    if (bgColor) {
      style = {
        style: { ...style.style, backgroundColor: bgColor.replace(bgColorKey, '') },
      }
    }

    return Object.keys(style).length > 0 ? style : null
  },
  blockRenderers: {
    unstyled: (block: DraftContentBlock) => {
      if (block.getText() === '') {
        return '<p>\n</p>'
      }
    },
    table: (block: DraftContentBlock) => {
      const prevBlock = currentContent.getBlockBefore(block.getKey())

      if (prevBlock && prevBlock.getType() === 'table') {
        return ''
      }

      const data = block.getData()
      const tableShape = data.get('tableShape')

      if (!tableShape) {
        return '<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>'
      }

      let tableStyle = Map(data.get('tableStyle'))
        .reduce((set, v, k) => {
          return set.add(`${k}: ${v}`)
        }, new OrderedSet())
        .toArray()
        .join('; ')
      tableStyle = tableStyle && ` style="${tableStyle}"`
      const tableKey = data.get('tableKey')
      const tableBlocks = currentContent
        .getBlockMap()
        .skipUntil(v => v.getType() === 'table' && v.getData().get('tableKey') === tableKey)
        .takeWhile(v => v.getType() === 'table')
        .toList()
      return `<table${tableStyle}><tbody>${tableShape
        .map(
          (
            row: Array<{
              element: string
              style: any
            }>,
            i: number,
          ) => {
            let rowStyle = Map(block.getData().get('rowStyle')[i])
              .reduce((set, v, k) => {
                return set.add(`${k}: ${v}`)
              }, new OrderedSet())
              .toArray()
              .join('; ')
            rowStyle = rowStyle && ` style="${rowStyle}"`
            return `<tr${rowStyle}>${row
              .map((cell, j) => {
                const tag = cell.element
                let cellStyle = Map(cell.style)
                  .reduce((set, v, k) => {
                    return set.add(`${k}: ${v}`)
                  }, new OrderedSet())
                  .toArray()
                  .join('; ')
                cellStyle = cellStyle && ` style="${cellStyle}"`
                return `<${tag}${cellStyle}>${buildHtmlForBlockText(
                  '',
                  tableBlocks.get(i * row.length + j),
                  currentContent,
                )}</${tag}>`
              })
              .join('')}</tr>`
          },
        )
        .join('')}</tbody></table>`
    },
    atomic: (block: DraftContentBlock) => {
      const entityKey = block.getEntityAt(0)
      const entity = currentContent.getEntity(entityKey)
      const entityType = entity.getType()
      const entityData = entity.getData()

      // NOTE: entityType IMAGE is support by default by draft-js-export-html
      switch (entityType) {
        case IFRAME: {
          const blockAlign = block.getData().get('alignment')
          const style = blockAlign ? `style="text-align: ${blockAlign}"` : ''
          const iframeStyle = `${
            entityData.marginX ? `margin-left: ${entityData.marginX}px; margin-right: ${entityData.marginX}px;` : ''
          } ${entityData.marginY ? `margin-top: ${entityData.marginY}px; margin-bottom: ${entityData.marginY}px;` : ''}`
          const attributes = `${entityData.title ? `title="${entityData.title}"` : ''} ${
            entityData.width ? `width="${entityData.width}"` : ''
          } ${entityData.height ? `height="${entityData.height}"` : ''}`
          return `<figure ${style.trim()}><iframe src="${
            entityData.src
          }" ${attributes} style="${iframeStyle.trim()}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></figure>`
        }

        case IMAGE: {
          const blockAlign = block.getData().get('alignment')
          const style = `${blockAlign ? `float: ${blockAlign};` : ''}`
          const imgStyle = `max-width: 100%; ${
            entityData.border ? `border-width: ${entityData.border}px; border-style: solid;` : ''
          } ${
            entityData.marginX ? `margin-left: ${entityData.marginX}px; margin-right: ${entityData.marginX}px;` : ''
          } ${entityData.marginY ? `margin-top: ${entityData.marginY}px; margin-bottom: ${entityData.marginY}px;` : ''}`
          const attributes = `${entityData.width ? `width="${entityData.width}"` : ''} ${
            entityData.height ? `height="${entityData.height}"` : ''
          }`
          const img = `<div style="${style.trim()}"><img loading="lazy" src="${entityData.src}" alt="${
            entityData.alt
          }" ${attributes} style="${imgStyle.trim()}" /></div>`
          return entityData.href?.length
            ? `<a href="${entityData.href}"${
                entityData.targetBlank ? ' target="_blank" rel="noopener noreferrer"' : ''
              } >${img}</a>`
            : img
        }

        case HR:
          return '<hr />'

        default:
          return null
      }
    },
  },
  blockStyleFn: (block: DraftContentBlock) => {
    if (block.getData().get('alignment')) {
      return {
        style: {
          textAlign: block.getData().get('alignment'),
        },
      }
    }
  },
  entityStyleFn: (entity: DraftEntity) => {
    const entityType = entity.get('type')

    if (entityType === LINK) {
      const { href, targetBlank } = entity.getData()
      return {
        element: 'a',
        attributes: {
          href,
          target: targetBlank ? '_blank' : undefined,
          rel: targetBlank ? 'noopener noreferrer' : undefined,
        },
      }
    }
  },
})
