import React from 'react'
import Header from '@/components/Sidebar/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import ContextSidebar from '@/components/Sidebar/ContextSidebar'
import SectionTabBar from '@/components/Sidebar/SectionTabBar'
import AuthGuard from '@/components/AuthGuard'
import RoleGuard from '@/components/RoleGuard'
import { RoleType } from '@/constants/user-roles'
import PropTypes from 'prop-types'

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard requireAuth={true}>
      <RoleGuard
        allowedRoles={[
          RoleType.ADMIN,
          RoleType.FINANCE,
          RoleType.SALES_MANAGER
        ]}
      >
        <div className={`main-wrapper`}>
            <Header />
            <Sidebar />
            <ContextSidebar />
            <div className="page-wrapper">
              <SectionTabBar />
              {children}
            </div>
          </div>
      </RoleGuard>
    </AuthGuard>
  )
}
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
}
