import type { ParsedPath } from 'path'
export as namespace Base
export interface AppDataInstance {
  uid: string
  path: string
  icon: string
  dir: string
  name: string
  modDir: string
}
export interface ModDataInstance extends ParsedPath {
  /**指向文件的绝对路径 */
  path: string
  date: string
  category?: string
  remarks?: string
  isinstall: boolean
}
