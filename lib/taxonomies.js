import icons from '../icons/css/icons.css'
import { capitalize } from './stringHelpers'

const taxonomyLabels = {
  food: "Food",
  housing: "Shelter",
  hygiene: "Hygiene",
  medical: "Medical",
  technology: "Computer"
}

export const getIcon = (taxonomy) => (
  icons[`icon${capitalize(taxonomy)}`] + ` icon-${taxonomy}`
)

export const taxonomiesWithIcons = (taxonomies) => (
  taxonomies.map(taxonomy => (
    {
      id: taxonomy,
      name: taxonomyLabels[taxonomy],
      icon: getIcon(taxonomy)
    }
  ))
)

export const relevantTaxonomies = (services) => {
  const servicesList = Object.values(services)
  return Array.from(new Set(servicesList.map(service => service.taxonomy)))
}
