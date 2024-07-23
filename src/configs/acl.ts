import { AbilityBuilder, Ability } from '@casl/ability'
import roles from 'src/constants/roles'

export type Subjects = string
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type AppAbility = Ability<[Actions, Subjects]> | undefined

export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string
}

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (role: string, subject: string) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  if (role === roles.admin) {
    can('manage', 'all')
  } else if (role === roles.humanResoursesChief) {
    can('manage', [
      'home',
      'users-session',
      'staff',
      'staff-add',
      'staff-edit',
      'vacation-session',
      'vacation-request',
      'vacations-history',
      'vacation-response',
      'vacation-calendar',
      'vacation-map',
      'vacation-marcation',
      'absence-request',
      'absence-response',
      'absence-history',
      'config-session',
      'config-organic-unit',
      'config-department',
      'anual-session-map',
      'config-organic-unit',
      'config-department'
    ])
  } else if (role === roles.sessionChief) {
    can('manage', [
      'home',
      'vacation-session',
      'vacation-request',
      'vacations-history',
      'vacation-response',
      'vacation-map',
      'vacation-marcation',
      'absence-request',
      'absence-response',
      'absence-history'
    ])
  } else if (role === roles.director) {
    can('manage', [
      'home',
      'vacation-session',
      'vacation-request',
      'vacations-history',
      'vacation-response',
      'vacation-map',
      'vacation-marcation',
      'absence-request',
      'absence-response',
      'absence-history'
    ])
  } else if (role === roles.technician) {
    can('manage', [
      'home',
      'vacation-session',
      'vacation-request',
      'vacations-history',
      'vacation-map',
      'vacation-marcation',
      'absence-request',
      'absence-history'
    ])
  } else if (role === 'client') {
    can(['read'], 'acl-page')
  } else {
    can(['read', 'create', 'update', 'delete'], subject)
  }

  return rules
}

export const buildAbilityFor = (role: string, subject: string): AppAbility => {
  return new AppAbility(defineRulesFor(role, subject), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object!.type
  })
}

export const defaultACLObj: ACLObj = {
  action: 'manage',
  subject: 'all'
}

export default defineRulesFor
