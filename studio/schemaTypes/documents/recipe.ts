import {defineArrayMember, defineField, defineType} from 'sanity'
import {ListIcon} from '@sanity/icons/List'
import {baseFields} from '../shared/baseFields'

/** The hop between a menu item and where allergen data actually lives. */
export const recipe = defineType({
  name: 'recipe',
  title: 'Recipe',
  type: 'document',
  icon: ListIcon,
  fields: [
    ...baseFields,
    defineField({
      name: 'yieldServings',
      title: 'Yield (servings)',
      type: 'number',
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: 'ingredients',
      title: 'Ingredients',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'ingredient'}]})],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'breadcrumb'}},
})
