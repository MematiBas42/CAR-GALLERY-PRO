import React from 'react'
import AdminSearch from '../admin/search'
import MobileSidebar from './mobile-sidebar'

const AdminHeader = async () => {
  return (
    <header className="flex h-[60px] items-center gap-4 px-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur md:bg-transparent md:border-none sticky top-0 z-30 w-full">
            <MobileSidebar />
			<div className="items-center flex-1 gap-4 md:gap-8 grid grid-cols-3 w-full">
				<div className="col-span-1 hidden md:block">
					<AdminSearch />
				</div>
			</div>
		</header>
  )
}

export default AdminHeader
