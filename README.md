pouchdb-wrappers
================
Makes wrapping PouchDB functions a lot easier. Handy for writing plug-ins.

Written to be used for (and developed alongside) PouchDB plug-ins.

[Website of those plug-ins](http://python-pouchdb.marten-de-vries.nl/plugins.html)

## Installation
```
npm install pouchdb-wrappers
```

## Usage
### Install wrapper methods
Possible wrappermethods are:
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

Initialise pouchdb-wrappers
```
const PouchDB = require('pouchdb')
const wrappers = require('pouchdb-wrappers')

const db = new PouchDB('galactic-alpaca')
```

Wrap your methods
```
wrappers.installWrapperMethods(db, {
  put: function (original, args) {
    // Do some stuff
    return original();
  }
});
```

Possible staticWrappermethods are:
- destroy
- new
- replicate
- allDbs

```
wrappers.installStaticWrapperMethods(db, {
  destroy: function (original, args) {
    // Do some stuff
    return original();
  }
});
```
### Uninstall wrappermethods:
```
wrappers.uninstallWrapperMethods(db, {
  put: function (original, args) {
    // Do some stuff
    return original();
  }
});

wrappers.uninstallStaticWrapperMethods(db, {
  put: function (original, args) {
    // Do some stuff
    return original();
  }
});
```

## Development
Local setup
```
git clone git@github.com:pouchdb/pouchdb-wrappers.git
cd pouchdb-wrappers
npm install
```

Run the tests
```
npm test
```

## License
pouchdb-wrappers is licensed under the [Apache 2 License](https://www.apache.org/licenses/LICENSE-2.0).
