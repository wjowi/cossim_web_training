'use client'

import React from 'react'
import PropTypes from 'prop-types'
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from '@/contexts/AuthContext'
        
export function Providers({ children }) {
  return (
      <PrimeReactProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </PrimeReactProvider>
  )
}

Providers.propTypes = {
  children: PropTypes.node.isRequired,
}
