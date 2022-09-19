'use strict'

function nodify (promise, callback) {
  promise
    .then((...args) => { callback(null, ...args) })
    .catch((err) => { callback(err) })
}

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
      base._handlers[method].unshift(handler)
    } else {
      base._handlers[method] = [handler]
      // create the new wrapped method
      base[method] = replacementMethod(method)
    }
  }
}

function replacementMethod (method) {
  return function (...args) {
    function doMethod () {
      // remove callback from args list if present
      let callback = null
      const minArgs = method === 'query' ? 1 : 0 // some methods take a function that is not a callback
      if (args.length > minArgs && typeof args[args.length - 1] === 'function') {
        callback = args.pop()
      }
      // compose handlers on top of the base method
      let prev = this._originals[method].bind(this)
      for (const handler of this._handlers[method]) {
        prev = handler.bind(this, prev)
      }
      // execute wrapped method, nodify result w/ callback
      const result = prev(...args)
      if (result.then && callback) { nodify(result, callback) }
      return result
    }
    // await pouchdb task queue before calling the method
    if (method !== 'changes' && this.taskqueue && !this.taskqueue.isReady) {
      const dbReady = new Promise((resolve, reject) => {
        this.taskqueue.addTask((error) => {
          // istanbul ignore next
          if (error) { reject(error) } else { resolve() }
        })
      })
      return dbReady.then(doMethod.bind(this))
    } else {
      return doMethod.call(this)
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

const toExport = {
  install: installWrappers,
  uninstall: uninstallWrappers
}

// istanbul ignore next
try {
  module.exports = toExport
} catch { /* module does not exist */ }

// istanbul ignore next
try {
  // attach to window if possible
  window.PouchDBWrappers = toExport
} catch { /* window does not exist */ }
