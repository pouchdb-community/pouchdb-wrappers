'use strict'

function installWrappers (base, handlers = {}) {
  if (!base._originals || !base._handlers) {
    base._originals = {}
    base._handlers = {}
  }
  for (const [method, handler] of Object.entries(handlers)) {
    if (!(method in base)) {
      // no original method, so it is unclear how to wrap it
      throw new Error(`Method '${method}' does not exist on given base, so it cannot be wrapped.`)
    }
    // save original if it hasn't already been saved
    if (!(method in base._originals)) {
      base._originals[method] = base[method]
    }
    // add a handler for this method
    if (method in base._handlers) {
      base._handlers[method].push(handler)
    } else {
      base._handlers[method] = [handler]
      // create the new wrapped method
      base[method] = function (...args) {
        // compose handlers on top of the base method
        const doMethod = () => {
          let prev = base._originals[method].bind(base)
          for (const handler of base._handlers[method]) {
            prev = handler.bind(base, prev)
          }
          return prev(...args)
        }
        // await pouchdb task queue before calling the method
        if (base.taskqueue && !base.taskqueue.isReady) {
          const promise = new Promise((resolve, reject) => {
            base.taskqueue.addTask((error) => {
              if (error) { return reject(error) } else { return resolve() }
            })
          })
          return promise.then(() => {
            return doMethod()
          })
        } else {
          return doMethod()
        }
      }
    }
  }
}

function uninstallWrappers (base, handlers) {
  if (!base._originals || !base._handlers) {
    throw new Error('No wrapper methods installed, so no methods can be uninstalled.')
  }
  for (const [method, handler] of Object.entries(handlers)) {
    const errorMessage = `Wrapper method for '${method}' not installed: ${handler.toString()}`
    if (!(method in base._handlers)) {
      throw new Error(errorMessage)
    }
    const i = base._handlers[method].indexOf(handler)
    if (i === -1) {
      throw new Error(errorMessage)
    } else {
      base._handlers[method].splice(i, 1)
    }
  }
}

module.exports = {
  install: installWrappers,
  uninstall: uninstallWrappers
}
