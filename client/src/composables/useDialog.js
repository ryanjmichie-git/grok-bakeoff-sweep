import { nextTick, onBeforeUnmount, unref, watch } from 'vue'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useDialog(isOpen, dialogRef, onClose) {
  let previous = null
  let token = 0

  const onKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const root = dialogRef.value
    if (!root) return
    const items = [...root.querySelectorAll(FOCUSABLE)].filter((el) => !el.hasAttribute('disabled'))
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const stop = watch(isOpen, (open) => {
    const myToken = ++token
    if (open) {
      previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
      nextTick(() => {
        if (myToken !== token || !unref(isOpen)) return
        const root = dialogRef.value
        if (!root) return
        document.addEventListener('keydown', onKeydown)
        const initial = root.querySelector(FOCUSABLE)
        if (initial) initial.focus()
      })
    } else {
      document.removeEventListener('keydown', onKeydown)
      if (previous) previous.focus()
      previous = null
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    stop()
  })
}
