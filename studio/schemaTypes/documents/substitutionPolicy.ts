import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {baseFields} from '../shared/baseFields'

/**
 * Knowledge Base source. Singleton.
 * Deliberately contradicts the (older) franchise operations manual on the
 * gluten-free wrap substitution.
 */
export const substitutionPolicy = defineType({
  name: 'substitutionPolicy',
  title: 'Substitution policy',
  type: 'document',
  icon: CaseIcon,
  fields: [
    ...baseFields,
    defineField({name: 'policyVersion', title: 'Policy version', type: 'string'}),
    defineField({
      name: 'supersedes',
      title: 'Supersedes',
      type: 'string',
      description: 'Names the older document this contradicts, so the conflict is traceable.',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'policyVersion'}},
})
