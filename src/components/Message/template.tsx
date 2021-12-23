import { useEffect, useState } from 'react'
import style from './index.module.scss'
export type PropType = 'info' | 'success' | 'warning' | 'error'
export const messageTypes = ['success', 'info', 'warning', 'error'] as const
export interface Props {
  type?: PropType
  showClose?: boolean
  msg?: string
  message?: string
  /**显示最大行数，超过显示省略号，为0时显示全部 */
  maxLine?: number
}
export default function (props: Props) {
  const [state, setState] = useState({
    className: style.Message,
    active: true,
  })
  const message = props.msg || props.message
  const close = () => {
    setState({
      ...state,
      active: false,
    })
  }
  useEffect(() => {
    setTimeout(() => {
      setState(state => {
        return {
          ...state,
          className: state.className + ' ' + style.inActive,
        }
      })
    })
  }, [])
  if (!state.active) return null
  return (
    <div className={state.className + ' ' + style[props.type as PropType]}>
      <div className={style.close} onClick={close}></div>
      <div
        title={message}
        className={style.content}
        style={{ WebkitLineClamp: props.maxLine || 4 }}
      >
        {message}
      </div>
    </div>
  )
}
