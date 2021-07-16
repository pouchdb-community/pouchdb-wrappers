/* global describe, it */
let assert = require('assert').strict
let PouchDB = require('pouchdb')
let Wrapper = require('.')

describe('PouchDB-wrappers', () => {
  let wrapper = Wrapper
  let db

  beforeEach(() => {
    db = new PouchDB('galactic-alpaca')
  })

  afterEach(() => {
    db.destroy()
  })

  it('should wrap put handler', async () => {
    let ok = false
    handler = {
      put: function (original, args) {
        ok = true
        return original()
      }
    }

    wrapper.installWrapperMethods(db, handler)

    await db.put({ _id: 'mydoc' })

    assert(ok)
  })

  it('should wrap destroy handler', async () => {
    let ok = false
    const handler = {
      destroy: function (original, args) {
        ok = true
        return original()
      }
    }

    wrapper.installWrapperMethods(db, handler)

    await db.destroy({ _id: 'mydoc' })

    assert(ok)
  })

  it('should throw an error when installing an already installed method', async () => {
    const handler = {
      put: function (original, args) {
        return original()
      }
    }

    wrapper.installWrapperMethods(db, handler)

    assert.throws(
      () => wrapper.installWrapperMethods(db, handler),
      `Error: "Wrapper method for 'put' already installed: ${handler.put}`
    )
  })

  it('should throw an error when uninstalling an non-installed method', async () => {
    const handler = {
      get: function (original, args) {
        return original()
      }
    }

    assert.throws(
      () => wrapper.uninstallWrapperMethods(db, handler),
      `Error: "Wrapper method for 'get' not installed: ${handler.get}`
    )
  })
})
