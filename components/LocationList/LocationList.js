import React, { PropTypes } from 'react'
import s from './LocationList.css'
import LocationRow from '../LocationRow'

const LocationList = (props) => (
  <div className={s.column}>
    {props.locations.map((location, index) => <LocationRow {...location} key={index} />)}
  </div>
)

export default LocationList
