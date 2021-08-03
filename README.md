# PouchDB-Wrappers

[![CI](https://github.com/pouchdb-community/pouchdb-wrappers/actions/workflows/ci.yaml/badge.svg)](https://github.com/pouchdb-community/pouchdb-wrappers/actions/workflows/ci.yaml)
[![NPM Version](https://img.shields.io/npm/v/pouchdb-wrappers.svg?style=flat-square)](https://www.npmjs.com/package/pouchdb-wrappers)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

A library used to wrap PouchDB functions easily.
Multiple handlers can be attached to methods,
so that multiple plugins can safely wrap the same methods.

As an example:

```javascript
const PouchDB = require('pouchdb')
const wrapper = require('pouchdb-wrappers')

// wrap static methods
wrapper.install(PouchDB, {
  // wrap the sync method so that we can time synchronization
  sync: async function (original, ...args) {
    console.time('sync')
    const result = await original(...args)
    console.timeEnd('sync')
    return result
  }
})

// or wrap instance methods
const db = new PouchDB('your_cool_project')
wrapper.install(db, {
  bulkDocs: async function (original, docs, ...args) {
    // handler methods receive unmodified parameters
    docs = docs.docs || docs
    for (const doc of docs) {
      // assign a timestamp to documents when added to the database
      if (doc._deleted || doc.createdAt) { continue }
      doc.createdAt = Date.now()
    }
    // then pass the modified params to the original
    return original(docs, ...args)
  }
})

// you can even wrap methods multiple times!
// the latest handler is run first, then the second-latest, and so on
wrapper.install(db, {
  bulkDocs: async function (original, docs, ...args) {
    docs = docs.docs || docs
    for (const doc of docs) {
      if (doc._deleted) { continue }
      // assign an update timestamp if it already has a creation timestamp
      if (doc.createdAt) { doc.updatedAt = Date.now() }
    }
    return original(docs, ...args)
  }
})

// you can also uninstall methods by signature
const handlers = { get: (original, ...args) => { return original(...args) } }
wrapper.install(db, handlers)    // wrap a method
wrapper.uninstall(db, handlers)  // remove a handler using its function
```

## Installation

The wrapper can be installed using [npm](https://www.npmjs.com/):

```bash
$ npm install pouchdb-wrappers
```

## Usage

### wrapper.install(base, handlers)

Install wrapper methods on the `base` object. Only methods that already exist
can be wrapped.

- `base`: The object to modify. May be either the PouchDB class or an instance of it.
- `handlers`: An object whose keys are the methods to wrap, and whose values are
the functions to wrap the original in.

The function signature of wrapper methods is `original, ...args`,
where `original` is the underlying method,
and `...args` is the list of arguments passed in.

As methods may be wrapped multiple times, `original` may refer to another handler.
Handlers are run from first-added to last-added, so that the first methods
installed are run first. The original method is run very last.

Attempting to wrap methods that do not exist will throw an error. Thus, to wrap
a custom method, you must first create that custom method. For example:

```javascript
// a custom constructor method
PouchDB.new = function (...args) {
  return new PouchDB(...args)
}
// now let's wrap the custom method
wrapper.install(PouchDB, {
  new: function (original, ...args) { /* wrap the 'new' method */ }
})
```

PouchDB supports using callbacks with its API methods, but callbacks will _not_
be passed to your wrapper methods. Wrappers which wrap asynchronous methods
should return a `Promise` and they should assume that the `original` function
returns a `Promise`. `pouchdb-wrappers` takes care of making callbacks work for
external callers. For example, if you install a `get()` wrapper...

```javascript
wrapper.install(db, {
  get: async function (original, ...args) {
    let doc = await original(...args)
    doc.modified = true
    return doc
  }
})
```

... then the application can still call `db.get()` with a callback. The callback
will not be included in the wrapper's `args` parameter and the wrapper doesn't
need to include any logic to make callbacks work.

```javascript
db.get('mydoc', { revs: true }, (error, doc) => {
  // doc.modified === true
})
```

### wrapper.uninstall(base, handlers)

Uninstall wrapper methods on the `base` object. Attempting to uninstall handlers
that do not exist will throw an error.

- `base`: The object to modify. May be either the PouchDB class or an instance.
- `handlers`: An object whose keys are the methods to wrap, and whose values are
the functions to wrap the original in.

## Development

If you encounter bugs or want to request features, please [file an issue](https://github.com/pouchdb/pouchdb-wrappers/issues)!

To hack on this project locally, first get the source and install dependencies:

```bash
$ git clone git@github.com:pouchdb/pouchdb-wrappers.git
$ cd pouchdb-wrappers
$ npm install
```

Then you can run the test suite:

```bash
$ npm test
```

*When contributing patches, be a good neighbor and include tests!*

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
