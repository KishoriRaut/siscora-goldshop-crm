import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gold Shop CRM',
    short_name: 'Gold CRM',
    description: 'सुन पसल व्यवस्थापन - Complete Gold Shop Management System for Nepali Gold Shops',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-dark-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
    categories: ['business', 'finance', 'productivity'],
    shortcuts: [
      {
        name: 'New Sale',
        short_name: 'Sale',
        description: 'Record a new sale',
        url: '/?tab=sales',
        icons: [{ src: '/icon.svg', sizes: '96x96' }],
      },
      {
        name: 'Inventory',
        short_name: 'Stock',
        description: 'View inventory',
        url: '/?tab=inventory',
        icons: [{ src: '/icon.svg', sizes: '96x96' }],
      },
      {
        name: 'Gold Rates',
        short_name: 'Rates',
        description: 'Update gold rates',
        url: '/?tab=gold-rates',
        icons: [{ src: '/icon.svg', sizes: '96x96' }],
      },
    ],
  }
}


