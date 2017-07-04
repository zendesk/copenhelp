/**
 * React Static Boilerplate
 * https://github.com/kriasoft/react-static-boilerplate
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Layout from '../../components/Layout';
import s from './about.css'

class AboutPage extends React.Component {

  componentDidMount() {
    document.title = 'About'
  }

  render() {
    return (
      <Layout>
        <img className={s.logo} src="/logo.svg"/>
        <div className={s.inset}>
          <div class="inset">
            <p>
              Copenhelp, a project of Bespoke and Zendesk, is intended to help homeless and low income residents of Copenhagen connect with information about critical resources. This mobile optimized website focuses on services like shelter, food, medical care, technology access, and hygiene services.
            </p>
            <p>
              Copenhelp is based on <a href="http://www.link-sf.org/">Link-SF</a>, a project designed and implemented by <a href="http://www.stanthonysf.org/">St. Anthony Foundation</a>, Zendesk, and user testing expert <a href="http://kimberlymccollister.com/design/">Kimberly McCollister</a>. This collaboration emerged as a result of a Community Benefits Agreement in the city of San Francisco. St. Anthony’s Tenderloin Technology Lab reached out to the tech community after observing an increase in the use of smart phones by low-income residents. Link-SF is a result of this process and is an attempt to use mobile technology to assist those most in need.
            </p>
          </div>
        </div>

        <img className={s.logo} src="/zendesk.svg"/>
        <div className={s.inset}>
          <p>Zendesk is a cloud-based customer service platform. It is designed to be easy to use, easy to customize, and easy to scale. Frustrated with the state of enterprise customer service software in 2007, three Danish entrepreneurs sought out to create beautifully simple software that could change how any company interacted with its customers. Today more than 30,000 companies use Zendesk to provide service to more than 200 million people worldwide.
          Zendesk has offices in eight countries, with headquarters in San Francisco. Funding from Charles River Ventures, Benchmark Capital, Goldman Sachs, GGV Capital, Index Ventures, Matrix Partners, and Redpoint Ventures. Learn more at www.zendesk.com.</p>
        </div>
        <br/>
        <div className={s.inset}>
          Link-SF is free software. Get it <a href="http://github.com/zendesk/linksf" about="_blank">here</a>
        </div>
        <br/>
        <p className={s.credits}>
          CDN hosting provided graciously by <a href="http://www.fast.ly">fast.ly</a><br/>
          Icons by P.J. Onori, Daniel Bruce, and Dave Gandy, courtesy of <a href="http://fontello.com">fontello.com</a>
        </p>
      </Layout>
    );
  }

}

export default AboutPage;
