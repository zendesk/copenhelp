import React from 'react'
import Link from '../Link'
import s from './Footer.css'

class Footer extends React.Component {
  render() {
    return (
      <footer className={s.footer} role="navigation">
        <Link className={s.nav} to="/terms">
          Terms
        </Link>
        <a className={s.nav} href="https://copenhelp.zendesk.com/hc/requests/new">
          Feedback
        </a>
        <Link className={s.nav} to="/about">
          About
        </Link>
      </footer>
    )
  }

}

export default Footer
