# Catenis File

Helper library used to prepare file contents to be stored/recovered onto/from the Bitcoin blockchain via Catenis Enterprise.

## Installation

```shell
npm install catenis-file
```

## Usage

### Prepare file contents to be stored onto the blockchain

#### Sending file contents at once

```javascript
const ctnFile = require('catenis-file');

// Sample file info
const fileInfo = {
    fileName: 'mysamplefile.txt',
    fileType: 'text/plain',
    fileContents: Buffer.from('This is only a test.')
};

// Prepend file metadata header to file contents
const modifiedFileContents = ctnFile.FileHeader.encode(fileInfo);

// Process modified file contents eventually passing it to Catenis to be stored
```

#### Break up file contents before sending them

```javascript
const ctnFile = require('catenis-file');

// Sample file info
const fileInfo = {
    fileName: 'mysamplefile.txt',
    fileType: 'text/plain',
    fileContents: Buffer.from('A very long text...')
};
        
// Prepend file metadata header to file contents
const modifiedFileContents = ctnFile.FileHeader.encode(fileInfo);

const msgChunker = new ctnFile.MessageChunker(modifiedFileContents, 1024);

let msgChunk;

while ((msgChunk = msgChunker.nextMessageChunk()) !== undefined) {
    // Process message chunk eventually passing it to Catenis to be stored
}
```

> **Note**: in practice, the content of a file only needs to be broken up if it is very long, typically above 10 MB.

### Recover file contents stored on the blockchain

#### Receive the whole file contents at once

```javascript
const ctnFile = require('catenis-file');

function receiveFile(fileContents) {
    const fileInfo = ctnFile.FileHeader.decode(Buffer.from(fileContents, 'base64'));
    
    // Process file info eventually saving file locally
}

// Read file contents (with metadata header, base64 encoded) from Catenis and call receiveFile() function
```

#### Receive file contents in chunks

```javascript
const ctnFile = require('catenis-file');

const msgChunker = new ctnFile.MessageChunker('base64');
let fileInfo;

function receiveFileChunk(fileChunk) {
    if (msgChunker.getBytesCount() === 0) {
        // First chunk. Extract file metadata and original contents
        fileInfo = ctnFile.FileHeader.decode(Buffer.from(fileChunk, 'base64'));
        
        fileChunk = fileInfo.fileContents.toString('base64');
    }
    
    msgChunker.newMessageChunk(fileChunk);
}

// Read file contents (with metadata header, base64 encoded) from Catenis in chunks and call receiveFileChunk()
//  function iteratively

// Then...
fileInfo.fileContents = Buffer.from(msgChunker.getMessage(), 'base64');

// Process file info eventually saving file locally
```

## License

This Node.js module is released under the [MIT License](LICENSE). Feel free to fork, and modify!

Copyright © 2020, Blockchain of Things Inc.

