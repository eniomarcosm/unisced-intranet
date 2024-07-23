// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): HorizontalNavItemsType => [
  {
    title: 'Home',
    path: '/sca/home',
    icon: 'tabler:smart-home'
  },
  {
    title: 'Second Page',
    path: '/sca/second-page',
    icon: 'tabler:mail'
  },
  {
    path: '/sca/acl',
    action: 'read',
    subject: 'acl-page',
    title: 'Access Control',
    icon: 'tabler:shield'
  }
]

export default navigation
