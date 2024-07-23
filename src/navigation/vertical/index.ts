// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Início',
      path: '/sca/home',
      icon: 'tabler:smart-home',
      action: 'read',
      subject: 'home'
    },
    {
      sectionTitle: 'Gestão de Usuários',
      action: 'read',
      subject: 'users-session'
    },
    {
      title: 'Usuários',
      path: '/sca/usuarios',
      icon: 'tabler:user',
      action: 'create',
      subject: 'users'
    },
    {
      title: 'Colaboradores',
      icon: 'tabler:users',
      children: [
        {
          title: 'Listar',
          path: '/sca/colaborador',
          action: 'read',
          subject: 'staff'
        },
        {
          title: 'Cadastrar',
          path: '/sca/colaborador/cadastrar',
          action: 'create',
          subject: 'staff-add'
        }
      ]
    },
    {
      sectionTitle: 'Gestão de Assiduidade',
      action: 'read',
      subject: 'vacation-session'
    },
    {
      title: 'Férias',
      icon: 'tabler:clock-exclamation',
      children: [
        {
          title: 'Marcação de Férias',
          path: '/sca/ferias/marcar',
          action: 'create',
          subject: 'vacation-marcation'
        },
        {
          title: 'Solicitar Férias',
          path: '/sca/ferias/solicitar',
          action: 'create',
          subject: 'vacation-request'
        },
        {
          title: 'Histórico de Férias',
          path: '/sca/ferias/historico',
          action: 'read',
          subject: 'vacations-history'
        },

        // {
        //   title: 'Calendario de Férias',
        //   path: '/sca/ferias/calendario',
        //   action: 'read',
        //   subject: 'vacation-calendar'
        // },
        {
          title: 'Mapa de Férias',
          path: '/sca/ferias/mapa',
          action: 'read',
          subject: 'vacation-map'
        },
        {
          title: 'Solicitações de Férias',
          path: '/sca/ferias/solicitacao',
          action: 'create',
          subject: 'vacation-response'
        }

        // {
        //   title: 'Solicitações de Férias',
        //   path: '/sca/ferias/solicitacao',
        //   action: 'create',
        //   subject: 'vacation-response'
        // }
      ]
    },
    {
      title: 'Faltas e Dispensas',
      icon: 'tabler:history-toggle',
      children: [
        {
          title: 'Justificar',
          path: '/sca/faltas/justificar',
          action: 'create',
          subject: 'absence-request'
        },
        {
          title: 'Histórico',
          path: '/sca/faltas/historico',
          action: 'manage',
          subject: 'absence-history'
        },
        {
          title: 'Solicitação',
          path: '/sca/faltas/solicitacao',
          action: 'create',
          subject: 'absence-response'
        },
        {
          title: 'Configurações',
          path: '/sca/faltas/configurações',
          action: 'create',
          subject: 'absence-config'
        }
      ]
    },
    {
      sectionTitle: 'Gestão de Configurações',
      action: 'read',
      subject: 'config-session'
    },
    {
      title: 'Configurações',
      icon: 'tabler:settings',
      children: [
        {
          title: 'Unidade Orgânicas',
          action: 'read',
          subject: 'config-organic-unit',
          path: '/sca/configurar/unidade-organica'
        },
        {
          title: 'Departartamentos',
          action: 'read',
          subject: 'config-department',
          path: '/sca/configurar/departamento'
        },
        {
          title: 'Sessão Anual de Férias',
          action: 'read',
          subject: 'anual-session-map',
          path: '/sca/configurar/sessaoanual'
        }

        // { title: 'Departartamentos', action: 'read', subject: 'acl-page', path: '/sca/acl' }
      ]
    }
  ]
}

export default navigation
