import template, { Props, messageTypes, PropType } from './template'
import { createElement } from 'react'
import { render } from 'react-dom'
interface Option extends Props {
  target?: HTMLElement
  timeout?: number
}
type MessageFn = (option: Option | string) => {
  close: () => void
}

interface MessageClass extends MessageFn {
  success: MessageFn
  warning: MessageFn
  info: MessageFn
  error: MessageFn
}

const Message: MessageFn & Partial<MessageClass> = function (
  option: Option | string
) {
  /**给定默认值 */
  let props = {
    timeout: 3 * 1000,
    target: document.body,
    type: 'success',
    showClose: true,
    maxLine: 3,
  } as Required<Option>
  if (typeof option === 'string') {
    props = { ...props, message: option }
  } else {
    props = { ...props, ...option }
  }
  const target = props.target
  const div = document.createElement('div')
  const close = () => {
    if (target.contains(div)) {
      div.remove()
    }
  }
  const message = createElement(template, { ...props })
  render(message, div)
  target.appendChild(div)
  setTimeout(() => {
    close()
  }, props.timeout)
  return { close }
}
messageTypes.forEach(type => {
  Message[type] = (option: Option | string) => {
    let props = {}
    if (typeof option === 'string') {
      props = { message: option }
    }
    return Message({
      ...props,
      type,
    })
  }
})
export default Message as MessageFn & Required<MessageClass>
