# pouchdb-wrappers

The `pouchdb-wrappers` library is used to wrap PouchDB functions easily. It is helpful in writing plug-ins. It can be used and developed alongside with PouchDB plug-ins.

[Website for plug-ins](http://python-pouchdb.marten-de-vries.nl/plugins.html)

## Installation

The wrapper can be installed using npm

```bash
npm install pouchdb-wrappers
```

## Usage

To use the `pouchdb-wrappers` library, the wrapper needs to be initialised and the relevant wrapper methods need to be installed.

### Initialise pouchdb-wrappers

`require` can be used to initialise the wrapper.

```javascript
const PouchDB = require('pouchdb')
const wrappers = require('pouchdb-wrappers')

const db = new PouchDB('galactic-alpaca')
```

### Install WrapperMethods

Once the wrapper is initialised, relevant methods in your application can be wrapped using `installWrapperMethods`. It accepts a database name and a request handler for the method.

```javascript
wrappers.installWrapperMethods(db, {
  put: function (original, args) {
    // Do some stuff
    return original();
  }
});
```

### Available wrapper methods

Following are some of the `WrapperMethods` that can be used for installing the methods.

- destroy
- put
- post
- get
- remove
- bulkDocs
- bulkGet
- allDocs
- createIndex
- deleteIndex
- find
- explain
- changes
- sync
- 'replicate.from'
- 'replicate.to'
- putAttachment
- getAttachment
- removeAttachment
- query
- viewCleanup
- info
- getIndexes
- compact
- revsDiff
- list
- rewriteResultRequestObject
- show
- update
- getSecurity
- putSecurity

### Install StaticWrappermethods

In addition to `WrapperMethods`, `StaticWrapperMethods` can be used. Some of the methods are listed below.

- destroy
- new
- replicate
- allDbs

The `StaticWrapperMethods` can be installed like so.

```javascript
wrappers.installStaticWrapperMethods(db, {
  destroy: function (original, args) {
    // Do some stuff
    return original();
  }
});
```

### Uninstall WrapperMethods

To uninstall the WrapperMethods, the following can be used.

```javascript
// Uninstall WrapperMethods
wrappers.uninstallWrapperMethods(db, {
  put: function (original, args) {
    // Do some stuff
    return original();
  }
});

// Uninstall StaticWrapperMethods
wrappers.uninstallStaticWrapperMethods(db, {
  put: function (original, args) {
    // Do some stuff
    return original();
  }
});
```

## Development

### Local setup

For local development clone the `pouchdb-wrappers` repository in your local machine and run installation.

```bash
git clone git@github.com:pouchdb/pouchdb-wrappers.git
cd pouchdb-wrappers
npm install
```

### Run tests

To run tests for your application you can use the following:

```bash
npm test
```

## License

`pouchdb-wrappers` is licensed under the [Apache 2 License](https://www.apache.org/licenses/LICENSE-2.0).
