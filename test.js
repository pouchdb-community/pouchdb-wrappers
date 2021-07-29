/* global describe, it, beforeEach, afterEach, emit */
const assert = require('assert').strict
const PouchDB = require('pouchdb')
const wrapper = require('.')

describe('PouchDB-wrappers', () => {
  let db

  beforeEach(() => {
    db = new PouchDB('galactic-alpaca')
  })

  afterEach(async () => {
    try { await db.destroy() } catch {}
  })

  it('should wrap put handler', async () => {
    let ok = false
    const handler = {
      put: function (original, ...args) {
        ok = true
        return original(...args)
      }
    }

    wrapper.install(db, handler)

    await db.put({ _id: 'mydoc' })

    assert(ok)
  })

  it('should wrap destroy handler', async () => {
    let ok = false
    const handler = {
      destroy: function (original, ...args) {
        ok = true
        return original(...args)
      }
    }

    wrapper.install(db, handler)

    await db.destroy({ _id: 'mydoc' })

    assert(ok)
  })

  it('should manage multiple handlers', async function () {
    let ok1, ok2
    const handlers1 = {
      get: function (original, ...args) {
        if (!ok2) ok1 = true // assert first-added runs first
        return original(...args)
      }
    }
    const handlers2 = {
      get: function (original, ...args) {
        ok2 = true
        return original(...args)
      }
    }
    wrapper.install(db, handlers1)
    wrapper.install(db, handlers2)
    await db.put({ _id: 'mydoc' })
    await db.get('mydoc')
    assert(ok1)
    assert(ok2)
  })

  it('should allow use of callbacks for wrappers', (done) => {
    wrapper.install(db, {
      get: async function (original, docId) {
        const doc = await original(docId)
        doc.modified = true
        return doc
      }
    })

    db.put({ _id: 'mydoc' }).then(() => {
      db.get('mydoc', (_, doc) => {
        assert(doc.modified)
        done()
      })
    })
  })

  it('should allow use of callbacks for wrappers with ...args', (done) => {
    wrapper.install(db, {
      get: async function (original, ...args) {
        const doc = await original(...args)
        doc.modified = true
        doc.args_count = args.length
        return doc
      }
    })

    db.put({ _id: 'mydoc' }).then(() => {
      db.get('mydoc', { revs: true }, (_, doc) => {
        assert.equal(doc._revisions.start, 1)
        assert(doc.modified)
        assert.equal(doc.args_count, 2)
        done()
      })
    })
  })

  it('should throw an error when uninstalling an non-installed method', async () => {
    let ok = false
    const handler = {
      get: function (original, ...args) {
        return original(...args)
      }
    }

    try {
      wrapper.uninstall(db, handler)
    } catch (err) {
      ok = true
      assert.equal(err.message, 'No wrapper methods installed, so no methods can be uninstalled.')
    } finally {
      assert(ok)
      ok = false
    }

    try {
      wrapper.install(db, {})
      wrapper.uninstall(db, handler)
    } catch (err) {
      ok = true
      assert.equal(err.message, `Wrapper method for 'get' not installed: ${handler.get.toString()}`)
    } finally {
      assert(ok)
    }
  })

  it('should successfully uninstall a method', async function () {
    let ok = true
    const handlers = {
      get: function (original, ...args) {
        ok = false
        return original(...args)
      }
    }
    wrapper.install(db, handlers)
    wrapper.uninstall(db, handlers)
    await db.put({ _id: 'mydoc' })
    await db.get('mydoc')
    assert(ok)
  })

  it('should not wrap methods that do not exist', function () {
    let ok = false
    try {
      wrapper.install(db, { fake: () => {} })
    } catch (err) {
      ok = true
      assert.equal(err.message, 'Method \'fake\' does not exist on given base, so it cannot be wrapped.')
    } finally {
      assert(ok)
    }
  })

  it('should not uninstall methods that are not installed', function () {
    let ok = false
    try {
      wrapper.install(db, { get: (original, ...args) => { return original(...args) } })
      wrapper.uninstall(db, { get: (a) => { return a } })
    } catch (err) {
      const errorInNode = 'Wrapper method for \'get\' not installed: (a) => { return a }'
      const errorInBrowser = 'Wrapper method for \'get\' not installed: a => {\n          return a;\n        }'
      if (err.message === errorInNode || err.message === errorInBrowser) {
        ok = true
      }
    } finally {
      assert(ok)
    }
  })

  it('should wrap synchronous methods ok', async function () {
    let ok = false
    wrapper.install(db, {
      changes: function (original, ...args) {
        ok = true
        return original(...args)
      }
    })
    const changes = db.changes()
    assert(changes.db)
    assert(ok)
  })

  it('should not callback-ify methods with function args that are not a callback', async function () {
    wrapper.install(db, {
      query: function (original, ...args) {
        return original(...args)
      }
    })
    await db.put({ _id: 'hello', hello: 'world' })
    const result = await db.query((doc) => {
      if (doc.hello === 'world') {
        emit(doc.hello)
      }
    })
    assert.equal(result.rows.length, 1)
    assert.equal(result.rows[0].id, 'hello')
    assert.equal(result.rows[0].key, 'world')
  })
})
