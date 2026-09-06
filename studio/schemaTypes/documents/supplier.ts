import {defineField, defineType} from 'sanity'
import {PackageIcon} from '@sanity/icons/Package'
import {baseFields} from '../shared/baseFields'

/** Holds the spec sheets. The cross-contact truth lives in the attached file, not in a field. */
export const supplier = defineType({
  name: 'supplier',
  title: 'Supplier',
  type: 'document',
  icon: PackageIcon,
  fields: [
    ...baseFields,
    defineField({
      name: 'supplierCode',
      title: 'Supplier code',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'specSheet',
      title: 'Product specification sheet',
      type: 'file',
      description:
        'Optional. The authoritative allergen statement is inside this document, deliberately not mirrored into a queryable field.',
    }),
    defineField({
      name: 'specSheetRevision',
      title: 'Spec sheet revision date',
      type: 'date',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'supplierCode'}},
})
