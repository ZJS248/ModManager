import React, { useEffect, useRef } from 'react'
import style from './index.module.scss'
interface Props {
  left: number
  top: number
  onBlur: (e: React.FocusEvent<HTMLFormElement, Element>) => void
  onRemove: () => void
  onAttribute: () => void
}
export default function GameContextMenu(props: Props): React.ReactElement {
  const { left, top, onBlur } = props
  const context = useRef<HTMLFormElement>(null)
  useEffect(() => {
    context.current?.focus()
  }, [])
  return (
    <form
      ref={context}
      className={style.GameContextMenu}
      style={{ left: left + 'px', top: top + 'px' }}
      onBlur={onBlur}
      tabIndex={1}
    >
      <div onClick={props.onRemove}>删除</div>
      <div onClick={props.onAttribute}>属性</div>
    </form>
  )
}
