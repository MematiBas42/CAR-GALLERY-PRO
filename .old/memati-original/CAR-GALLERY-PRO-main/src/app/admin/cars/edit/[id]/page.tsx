import { validateIdSchema } from '@/app/schemas/form.schema'
import CarForm from '@/components/car/car-form'
import { routes } from '@/config/routes'
import { PageProps } from '@/config/types'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import React from 'react'

const EditcarPage = async (props : PageProps) => {
  const params = await props.params
  const  {data, success}= validateIdSchema.safeParse({
    id: Number(params?.id)
  })

  if (!success) {
    redirect(routes.admin.cars)
  }

  const car = await prisma.classified.findUnique({
    where: {
      id: data.id
    },
    include: {
      images: true
    }
  })

  if (!car) {
    redirect(routes.admin.cars)
  }

  //console.log(car)
  return (
    <div>
      <CarForm
        car={car}
      />
    </div>
  )
}

export default EditcarPage
