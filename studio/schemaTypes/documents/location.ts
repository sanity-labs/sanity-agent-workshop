import {defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'
import {baseFields} from '../shared/baseFields'

export const location = defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  icon: PinIcon,
  fields: [
    ...baseFields,
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'region', title: 'State / region', type: 'string'}),
    defineField({
      name: 'market',
      title: 'Market',
      type: 'string',
      options: {
        list: [
          {title: 'New York City', value: 'nyc'},
          {title: 'Austin', value: 'austin'},
          {title: 'Chicago', value: 'chicago'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ownership',
      title: 'Ownership',
      type: 'string',
      options: {
        list: [
          {title: 'Corporate', value: 'corporate'},
          {title: 'Franchise', value: 'franchise'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'openedDate', title: 'Opened', type: 'date'}),
  ],
  preview: {select: {title: 'title', subtitle: 'breadcrumb'}},
})
