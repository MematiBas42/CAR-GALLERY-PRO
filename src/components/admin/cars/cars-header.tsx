import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import Link from 'next/link';
import RadioFilter from '@/components/shared/radio-filter';
import { AwaitedPageProps } from '@/config/types';
import { ClassifiedStatus } from '@prisma/client';
import { useTranslations } from 'next-intl';

const CarManageHeader = ({searchParams}: AwaitedPageProps) => {
  const t = useTranslations("Admin.cars");
  return (
    <div className='flex flex-col p-6 space-y-4'>
      <div className="flex items-center justify-between">
        <h1 className='font-bold text-lg md:text-2xl'>
            {t("title")}
        </h1>
        <div className='flex items-center justify-between'>
            <RadioFilter
                searchParams={searchParams}
                items={["ALL", ...Object.values(ClassifiedStatus)]}
            />
            <Button asChild className="ml-4" size={"sm"}>
              <Link href={routes.admin.newCar}>{t("addNew")}</Link>
            </Button>
        </div>
      </div>
    </div>
  )
}

export default CarManageHeader
