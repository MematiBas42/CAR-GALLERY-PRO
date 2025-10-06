import { CarWithImages, Favourites } from '@/config/types'
import React from 'react'
import CarCard from './car-card'

interface CarsListProps {
    cars: CarWithImages[]
    favourites: number[]
}

const CarsList = ({cars,favourites}: CarsListProps) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {cars.map((car) => (
        <CarCard key={car.id} car={car} 
favourites={favourites}
        />

      ))}
    </div>
  )
}

export default CarsList
