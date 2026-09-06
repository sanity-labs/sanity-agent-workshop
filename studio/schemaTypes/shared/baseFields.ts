import {defineField} from 'sanity'

/**
 * The nine major allergens. Values are the canonical tokens used in both
 * `menuItem.allergens` (declared) and `ingredient.allergenTags` (actual).
 */
export const ALLERGEN_OPTIONS = [
  {title: 'Milk', value: 'milk'},
  {title: 'Egg', value: 'egg'},
  {title: 'Fish', value: 'fish'},
  {title: 'Shellfish', value: 'shellfish'},
  {title: 'Tree nuts', value: 'tree-nuts'},
  {title: 'Peanut', value: 'peanut'},
  {title: 'Wheat', value: 'wheat'},
  {title: 'Soy', value: 'soy'},
  {title: 'Sesame', value: 'sesame'},
]

export const STATUS_OPTIONS = [
  {title: 'Published', value: 'published'},
  {title: 'Deprecated', value: 'deprecated'},
  {title: 'Internal', value: 'internal'},
]

/**
 * Universal fields carried by every document type in this dataset.
 *
 * `breadcrumb` and `status` are deliberately required: they are the two fields
 * people skip, and the two that cause the embarrassing retrieval failures this
 * workshop is built to demonstrate.
 */
export const baseFields = [
  defineField({
    name: 'title',
    title: 'Title',
    type: 'string',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'breadcrumb',
    title: 'Breadcrumb',
    type: 'string',
    description:
      'Denormalized path, e.g. "Bowls › Thai Crunch Bowl › Tamarind-lime sauce". Gives a retrieved chunk its place in the hierarchy without a second query.',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'body',
    title: 'Body',
    type: 'text',
    rows: 4,
    description: 'Self-contained prose. Must make sense on its own, with no surrounding context.',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'status',
    title: 'Status',
    type: 'string',
    options: {list: STATUS_OPTIONS, layout: 'radio'},
    initialValue: 'published',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'effectiveDate',
    title: 'Effective date',
    type: 'date',
    description:
      'When this record became authoritative. Used to resolve conflicts between sources.',
    validation: (rule) => rule.required(),
  }),
]
