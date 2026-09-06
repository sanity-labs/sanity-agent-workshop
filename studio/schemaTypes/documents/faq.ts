import {defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {baseFields} from '../shared/baseFields'

/**
 * Where customers enter — and where one confidently wrong answer lives.
 * `title` is the question; `body` is the answer as published.
 */
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    ...baseFields,
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'string',
      options: {
        list: [
          {title: 'Allergens', value: 'allergens'},
          {title: 'Dietary', value: 'dietary'},
          {title: 'Ordering', value: 'ordering'},
          {title: 'Locations', value: 'locations'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'topic'}},
})
