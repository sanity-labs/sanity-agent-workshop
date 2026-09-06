import {defineField, defineType} from 'sanity'
import {TransferIcon} from '@sanity/icons/Transfer'
import {baseFields} from '../shared/baseFields'

/**
 * Knowledge Base source. Singleton. The shared fryer and prep surfaces.
 * Every allergen entry in the KB is expected to end with this text, verbatim.
 */
export const crossContactStatement = defineType({
  name: 'crossContactStatement',
  title: 'Cross-contact statement',
  type: 'document',
  icon: TransferIcon,
  fields: [
    ...baseFields,
    defineField({
      name: 'verbatimStatement',
      title: 'Verbatim statement',
      type: 'text',
      rows: 3,
      description: 'Quoted exactly, without paraphrase, at the end of every allergen entry.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'breadcrumb'}},
})
