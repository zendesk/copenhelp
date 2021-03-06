import React, { PropTypes } from 'react'
import s from './Location.css'
import icons from '../../icons/css/icons.css'

import { relevantTaxonomies, getIcon, getLabel } from '../../lib/taxonomies'
import { capitalize } from '../../lib/stringHelpers'

import Link from '../Link'
import GoogleMap from '../GoogleMap'

const getGender = (abbr) => {
  if (abbr === '' || abbr === 'MF' || abbr === 'FM') return 'Everyone'
  return abbr === 'F' ? 'Women' : 'Men'
}

const getGenderAdj = (abbr) => {
  if (abbr === '' || abbr === 'MF' || abbr === 'FM') {
    return 'All'
  }
  return abbr === 'F' ? 'Female' : 'Male'
}

const getAge = (abbr) => {
  switch (abbr) {
    case 'C':
      return 'children'
    case 'Y':
      return 'teens'
    case 'A':
      return 'adults'
    case 'S':
      return 'seniors'
    default:
      return ''
  }
}

const getAllEligibilities = (services) => {
  const allEligibilities = Object.values(services)
    .map(service => service.eligibility)
    .reduce((acc, eligibility) => {
      const { gender, age, cpr } = acc
      const moreGender = [...gender, eligibility.gender]
      const moreAge = eligibility.age ? [...age, ...eligibility.age] : age // ['C', 'Y']
      const moreCpr = eligibility.cpr ? [...cpr, eligibility.cpr] : cpr
      return { gender: moreGender, age: moreAge, cpr: moreCpr }
    }, { gender: [], age: [], cpr: [] })
  return {
    gender: Array.from(new Set(allEligibilities.gender)).join(''),
    age: Array.from(new Set(allEligibilities.age)),
    cpr: Array.from(new Set(allEligibilities.cpr)),
  }
}

const getCPRString = (cprs = []) => {
  const isCPRRequired = cprs.reduce((acc, value) => acc || value, false)

  return isCPRRequired ? 'A Danish ID is required here.' : 'A Danish ID is not required here.'
}

const getEligibility = ({ gender, age = [], cpr }) => {
  const cprString = getCPRString(cpr)
  const ages = age.map(getAge).join(', ')

  return (gender === '' && age.length === 0) ?
    `${getGender(gender)}; ${cprString}` :
    `${getGenderAdj(gender)} ${ages}; ${getCPRString(cpr)}`
}

const getMapsUrl = (location) => {
  const { latitude, longitude } = location
  return `https://maps.google.com/maps?q=loc:${latitude},${longitude}`
}

const DAYS = {
  0: 'monday',
  1: 'tuesday',
  2: 'wednesday',
  3: 'thursday',
  4: 'friday',
  5: 'saturday',
  6: 'sunday'
}

const DAY_ABBREVIATIONS = {
  sunday: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
}

const formatTime = (time) => {
  const timeStr = `${time}`
  const paddedTimeStr = '0'.repeat(4 - timeStr.length) + timeStr

  const minutes = paddedTimeStr.slice(-2)
  const hours = paddedTimeStr.slice(0, 2)

  return `${hours}:${minutes}`
}

const getDailySchedules = (schedules) => {
  const daySchedules = Object.assign({}, DAY_ABBREVIATIONS)
  Object.keys(daySchedules).forEach(day => {
    daySchedules[day] = []
  })
  schedules
    .forEach(schedule => {
      if(schedule.opensAt != schedule.closesAt) { // Check if location is open
        const day = schedule.weekday.toLowerCase()
        const daySchedule = daySchedules[day]
        daySchedule.push({
          opensAt: schedule.opensAt,
          closesAt: schedule.closesAt,
        })
      }
    })
  return daySchedules
}

const getTimeRange = hours => {
  if (hours.opensAt == 0 && hours.closesAt == 2359 ) {
    return `24 hours`
  } else {
    return `${formatTime(hours.opensAt)} - ${formatTime(hours.closesAt)}`
  }
}

const Schedule = (props) => {
  const daySchedules = getDailySchedules(props.schedules)
  const indexToDaySchedule = index => daySchedules[DAYS[index]]
  const dayHasSchedules = daySchedule => indexToDaySchedule(daySchedule).length > 0
  const scheduleRows = Object.keys(DAYS).sort()
    .filter(dayHasSchedules)
    .map(index => (
      <tr key={`day-${index}`}>
        <td className={s.labelHour}>
          <b>{DAY_ABBREVIATIONS[DAYS[index]]}</b>
        </td>
        <td className={s.hour}>
          {indexToDaySchedule(index)
              .sort((a, b) => a.opensAt < b.opensAt)
              .map(getTimeRange)
              .join(', ')
          }
        </td>
      </tr>
    ))
  return (
    <table className={s.openHours}>
      <tbody>
        {scheduleRows}
      </tbody>
    </table>
  )
}

const Location = (props) => {
  const { location, organization } = props
  const { services = [] } = location
  return (
    <div className={s.location}>
      <div className={s.section}>
        <h2 className={s.name}>{location.name}</h2>
        <span className={s.label}>Welcome: </span>
          {getEligibility(getAllEligibilities(services))}
      </div>
      <p className={s.title}>Services</p>
      <div className={s.section}>
        <div className={s.categoryIcons}>
          {relevantTaxonomies(services).map((taxonomy, index) => (
            <span key={`category-${index}`}>
              <i className={`category-icon ${getIcon(taxonomy)}`}></i>
              {getLabel(taxonomy)}
            </span>
          ))}
        </div>
      </div>
      {location.physicalAddress &&
        <div className={s.insetMap}>
          <div className={s.map}>
            <GoogleMap lat={location.latitude} long={location.longitude} />
          </div>
          <p className={s.address}>
            {location.physicalAddress.address1}
          </p>
        </div>
      }
      {organization.phones &&
        <div className={s.inset + ' ' + s.insetInGroup}>
          <label className={`${s.contactLabel} ${icons.iconPhone} icon-phone`}>Call </label>
            <div className={s.callPhone}>
               {organization.phones.map((phone, index) => (
                <div key={`phone-${index}`}>
                  <a
                    className={s.phone}
                    href={'tel:' + phone.number.replace(/[^\d]/g, '')}
                  >{phone.number}</a>
                  <span className={s.phoneDepartment}>{phone.department}</span>
                </div>
              ))}
            </div>
        </div>
      }
      {organization.url &&
        <div className={s.inset + ' ' + s.insetInGroup}>
          <label className={`${s.contactLabel} ${icons.iconLink} icon-website`}>Website </label>
          <span className={s.websiteUrl}>
            <a
              className={s.website}
              href={organization.url}
              rel="nofollow"
              target="_blank">
              {organization.url}
            </a>
          </span>
        </div>
      }
      <div className={s.inset + ' ' + s.insetInGroup}>
        <a
          href={getMapsUrl(location)}
          rel="nofollow"
          target="_blank"
        >
          <button>
            <label className={`${s.directionsLabel} ${icons.iconCompass} icon-compass`}>Directions</label>
          </button>
        </a>
      </div>
      <ul title="Services details" className={s.servicesList}>
        {services && Object.values(services).map((service, index) => (
          <li key={`service-${index}`} className={s.insetServices}>
            <div className={s.noteWrapper}>
              <h3 className={s.serviceTitle}>{service.name}</h3>
              <p className={s.serviceDescription}>{service.description}</p>
              <Schedule schedules={service.schedules} />
            </div>
            <div className={s.notes}>
              <label>Notes</label>
              <p>{service.applicationProcess}</p>
            </div>
            {service.eligibility.notes &&
              <div className={s.eligibility}>
                <label>Eligibility Notes</label>
                <p>{service.eligibility.notes}</p>
              </div>
            }
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Location
