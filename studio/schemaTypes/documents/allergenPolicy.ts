import {defineField, defineType} from 'sanity'
import {WarningOutlineIcon} from '@sanity/icons/WarningOutline'
import {baseFields} from '../shared/baseFields'

/** Knowledge Base source. Singleton — current and strict. */
export const allergenPolicy = defineType({
  name: 'allergenPolicy',
  title: 'Allergen policy',
  type: 'document',
  icon: WarningOutlineIcon,
  fields: [
    ...baseFields,
    defineField({name: 'policyVersion', title: 'Policy version', type: 'string'}),
    defineField({
      name: 'supersedes',
      title: 'Supersedes',
      type: 'string',
      description: 'What this policy replaces, for resolving conflicts with older documents.',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'policyVersion'}},
})
