import type { Profile, TypeCode } from '../types'
import { ALPHA } from './alpha'
import { BETA } from './beta'
import { GAMMA } from './gamma'
import { DELTA } from './delta'

export const PROFILES = { ...ALPHA, ...BETA, ...GAMMA, ...DELTA } as Record<TypeCode, Profile>
