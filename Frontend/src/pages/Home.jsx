import React from 'react'
import HeroSlider from '../components/HeroSlider'
import Trending from '../components/section/Trending'
import TrendingTabs from '../components/section/TrendingTabs'
import { useSelector } from 'react-redux'

const Home = () => {
  return (
    <div className='pt-16'>
      <HeroSlider/>
      <TrendingTabs/>
      <Trending/>
    </div>
  )
}

export default Home