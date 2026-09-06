import {defineArrayMember, defineField, defineType} from 'sanity'
import {ComponentIcon} from '@sanity/icons/Component'
import {ALLERGEN_OPTIONS, baseFields} from '../shared/baseFields'

/**
 * Where allergen tags actually live. `allergenTags` is the real per-ingredient
 * picture and will not agree with `menuItem.allergens` everywhere — that
 * disagreement is the point.
 */
export const ingredient = defineType({
  name: 'ingredient',
  title: 'Ingredient',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    ...baseFields,
    defineField({
      name: 'allergenTags',
      title: 'Allergen tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {list: ALLERGEN_OPTIONS},
      description:
        'Allergens present as ingredients. Cross-contact lives with the supplier, not here.',
    }),
    defineField({
      name: 'supplier',
      title: 'Supplier',
      type: 'reference',
      to: [{type: 'supplier'}],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'breadcrumb'}},
})
