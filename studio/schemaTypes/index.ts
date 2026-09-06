import {allergenPolicy} from './documents/allergenPolicy'
import {crossContactStatement} from './documents/crossContactStatement'
import {faq} from './documents/faq'
import {ingredient} from './documents/ingredient'
import {location} from './documents/location'
import {menuItem} from './documents/menuItem'
import {prepStandard} from './documents/prepStandard'
import {recipe} from './documents/recipe'
import {substitutionPolicy} from './documents/substitutionPolicy'
import {supplier} from './documents/supplier'

export const schemaTypes = [
  // Core — the filter surface and the hops beneath it
  menuItem,
  recipe,
  ingredient,
  supplier,
  location,
  // Knowledge Base sources
  allergenPolicy,
  crossContactStatement,
  substitutionPolicy,
  prepStandard,
  faq,
]
