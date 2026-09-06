import {defineArrayMember, defineField, defineType} from 'sanity'
import {BasketIcon} from '@sanity/icons/Basket'
import {ALLERGEN_OPTIONS, baseFields} from '../shared/baseFields'

/**
 * The filter surface. Every GROQ-shaped question in the workshop runs through
 * this type.
 *
 * Deliberately absent: any `spicy` or `heaviness` field. Heat and heft are only
 * ever describable in `body` prose — the moment either becomes a flag, the
 * semantic questions collapse into filters and teach nothing.
 */
export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menu item',
  type: 'document',
  icon: BasketIcon,
  fields: [
    ...baseFields,
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Bowl', value: 'bowl'},
          {title: 'Wrap', value: 'wrap'},
          {title: 'Salad', value: 'salad'},
          {title: 'Side', value: 'side'},
          {title: 'Kids', value: 'kids'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceCents',
      title: 'Price (cents)',
      type: 'number',
      description: 'Integer cents, to keep money out of floating point.',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'calories',
      title: 'Calories',
      type: 'number',
      description:
        'Nullable on purpose. An absent value is a fact — never derive, estimate, or sum it from the recipe.',
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: 'allergens',
      title: 'Declared allergens',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {list: ALLERGEN_OPTIONS},
      description:
        'What the menu declares. This is NOT a complete rollup of the recipe — compare against ingredient.allergenTags.',
    }),
    defineField({
      name: 'dietaryFlags',
      title: 'Dietary flags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: 'Vegan', value: 'vegan'},
          {title: 'Vegetarian', value: 'vegetarian'},
          {title: 'Gluten-free option', value: 'gluten-free-option'},
        ],
      },
      description:
        'Authoritative and hand-set. Never derived by traversing the recipe — that is what keeps the vegan question a clean filter.',
    }),
    defineField({
      name: 'locations',
      title: 'Available at',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'location'}]})],
    }),
    defineField({
      name: 'recipe',
      title: 'Recipe',
      type: 'reference',
      to: [{type: 'recipe'}],
      description: 'The hop toward per-ingredient allergen data. Not every item has one.',
    }),
    defineField({
      name: 'availableFrom',
      title: 'Available from',
      type: 'date',
    }),
    defineField({
      name: 'availableUntil',
      title: 'Available until',
      type: 'date',
      description: 'A past date means the item is off the menu, whatever an external source says.',
    }),
    // ── Track 2 targets ──────────────────────────────────────────────────
    // Both ship EMPTY in the seed on purpose. Track 1 never reads them; Track 2
    // needs a visible before-and-after when the Function drafts them.
    defineField({
      name: 'description',
      title: 'Guest-facing description',
      type: 'object',
      description:
        'base is drafted from the linked recipe (Mission 2-2). The three market fields are variants (Mission 2-3) — NYC is corporate, Austin and Chicago are franchised. All empty in the seed on purpose; that absence is the before-and-after.',
      fields: [
        defineField({name: 'base', title: 'Base copy', type: 'text', rows: 3}),
        defineField({name: 'nyc', title: 'NYC', type: 'text', rows: 3}),
        defineField({name: 'austin', title: 'Austin', type: 'text', rows: 3}),
        defineField({name: 'chicago', title: 'Chicago', type: 'text', rows: 3}),
      ],
    }),
    defineField({
      name: 'allergenCallout',
      title: 'Allergen callout',
      type: 'text',
      rows: 4,
      description:
        'Drafted from ingredient.allergenTags via the recipe, NOT from the declared allergens array. Must end with the current cross-contact statement verbatim. Deliberately NOT per-market — a safety statement does not localize.',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'breadcrumb', status: 'status'},
    prepare: ({title, subtitle, status}) => ({
      title,
      subtitle: status === 'published' ? subtitle : `[${status}] ${subtitle}`,
    }),
  },
})
