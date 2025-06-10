import React from 'react'
import Header from '../../components/Header'
import HeroSection from '../../components/HeroSection'
import PeriodEvents from '../../components/PeriodEvents'
import FAQ from '../../components/FAQ'
import Testimonials from '../../components/Testimonials'
import Footer from '../../components/Footer'
import CreateEvent from '../../components/CreateEvent'
import About from './about'
import Events from '../../components/EventList'


const home = () => {
  return (
    <div className="content">

      <div className="sticky top-0 z-100">
        <Header/>
      </div>

       <div className="bottom-header">
        <HeroSection/>
      </div>

        <div className="p-6">
        <PeriodEvents/>
        <Events/>
      </div>
        <div className="our-us">
        <About/>
      </div>
        <div className="content-create">
        <CreateEvent/>
        <Testimonials/>
        <FAQ/>
      </div>

      <Footer/>

      </div>

    

   
  )
}

export default home