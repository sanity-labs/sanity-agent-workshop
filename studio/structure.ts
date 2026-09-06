import {BasketIcon} from '@sanity/icons/Basket'
import {CaseIcon} from '@sanity/icons/Case'
import {ClipboardIcon} from '@sanity/icons/Clipboard'
import {ComponentIcon} from '@sanity/icons/Component'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {ListIcon} from '@sanity/icons/List'
import {PackageIcon} from '@sanity/icons/Package'
import {PinIcon} from '@sanity/icons/Pin'
import {TransferIcon} from '@sanity/icons/Transfer'
import {WarningOutlineIcon} from '@sanity/icons/WarningOutline'
import type {StructureResolver} from 'sanity/structure'

const MENU_CATEGORIES = [
  {title: 'Bowls', value: 'bowl'},
  {title: 'Wraps', value: 'wrap'},
  {title: 'Salads', value: 'salad'},
  {title: 'Sides', value: 'side'},
  {title: 'Kids', value: 'kids'},
]

/**
 * Ten flat types in the default list is noise for someone who has never opened
 * a Studio. Grouped instead as the restaurant thinks about it.
 *
 * `menuItem`'s preview already prefixes non-published items with `[internal]`
 * or `[deprecated]` — that is how you find the Winter Miso Bowl.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Green & Gather')
    .items([
      S.listItem()
        .title('Menu')
        .icon(BasketIcon)
        .child(
          S.list()
            .title('Menu')
            .items([
              S.listItem()
                .title('All items')
                .icon(BasketIcon)
                .child(S.documentTypeList('menuItem').title('All menu items')),
              S.divider(),
              ...MENU_CATEGORIES.map((category) =>
                S.listItem()
                  .title(category.title)
                  .child(
                    S.documentList()
                      .title(category.title)
                      .schemaType('menuItem')
                      .filter('_type == "menuItem" && category == $category')
                      .params({category: category.value})
                      .apiVersion('2025-05-08'),
                  ),
              ),
            ]),
        ),
      S.documentTypeListItem('recipe').title('Recipes').icon(ListIcon),
      S.documentTypeListItem('ingredient').title('Ingredients').icon(ComponentIcon),
      S.documentTypeListItem('supplier').title('Suppliers').icon(PackageIcon),
      S.documentTypeListItem('location').title('Locations').icon(PinIcon),
      S.divider(),

      // The four Knowledge Base source types.
      S.listItem()
        .title('Policies & Food Safety')
        .icon(WarningOutlineIcon)
        .child(
          S.list()
            .title('Policies & Food Safety')
            .items([
              S.documentTypeListItem('allergenPolicy')
                .title('Allergen policy')
                .icon(WarningOutlineIcon),
              S.documentTypeListItem('crossContactStatement')
                .title('Cross-contact statement')
                .icon(TransferIcon),
              S.documentTypeListItem('substitutionPolicy')
                .title('Substitution policy')
                .icon(CaseIcon),
              S.documentTypeListItem('prepStandard').title('Prep standards').icon(ClipboardIcon),
            ]),
        ),
      S.documentTypeListItem('faq').title('FAQ').icon(HelpCircleIcon),
    ])
