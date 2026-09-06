import {defineField, defineType} from 'sanity'
import {ClipboardIcon} from '@sanity/icons/Clipboard'
import {baseFields} from '../shared/baseFields'

/** Knowledge Base source. In-store vs. commissary prep, and shared equipment. */
export const prepStandard = defineType({
  name: 'prepStandard',
  title: 'Prep standard',
  type: 'document',
  icon: ClipboardIcon,
  fields: [
    ...baseFields,
    defineField({
      name: 'scope',
      title: 'Scope',
      type: 'string',
      options: {
        list: [
          {title: 'In-store preparation', value: 'in-store'},
          {title: 'Commissary preparation', value: 'commissary'},
          {title: 'Shared equipment', value: 'shared-equipment'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'scope'}},
})
