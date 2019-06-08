/**
 * Function class to be used for both passing or reading messages in chunks to/from Catenis
 *
 * @param [message] {Buffer} The whole message's contents to be chunked. Required for passing messages in chunks
 *  to Catenis
 * @param maxChunkSizeOrEncoding {number|string} If a number is passed, it is the maximum size, in bytes, that a
 *  message chunk can be (after base64 encoding). Required for passing messages in chunks to Catenis. Otherwise,
 *  a string should be passed and, in that case, it specifies the text encoding to be used for received message
 *  chunks. Required for reading messages in chunks from Catenis
 * @constructor
 */
function MessageChunker(message, maxChunkSizeOrEncoding) {
    if (typeof message === 'number' || typeof message === 'string') {
        maxChunkSizeOrEncoding = message;
        message = undefined;
    }

    this.message = message || Buffer.from('');
    this.bytesCount = 0;

    if (typeof maxChunkSizeOrEncoding === 'number') {
        // Maximum chunk size provided
        this.maxChunkSize = maxChunkSizeOrEncoding;

        // Calculate maximum size of raw (unencoded) message chunk
        this.maxRawChunkSize = Math.floor(this.maxChunkSize / 4) * 3;
    }
    else if (typeof maxChunkSizeOrEncoding === 'string') {
        // Encoding provided
        this.encoding = maxChunkSizeOrEncoding;
    }
}

/**
 * Retrieves next message chunk. Used when passing messages in chunks to Catenis
 *
 * @returns {string|undefined} The message chunk encoding in base64
 */
MessageChunker.prototype.nextMessageChunk = function () {
    if (this.maxChunkSize) {
        const chunkSize = Math.min(this.message.length, this.maxRawChunkSize);

        if (chunkSize > 0) {
            const msgChunk = this.message.slice(0, chunkSize);
            this.message = this.message.slice(chunkSize);

            this.bytesCount += chunkSize;

            return msgChunk.toString('base64');
        }
    }
};

/**
 * Accumulates a new chunk of data to the message. Used when reading messages in chunks from Catenis
 *
 * @param msgDataChunk {string} The message chunk to be accumulated. It should be encoded in the text encoding
 *  specified when the MessageChunker object was instantiated
 */
MessageChunker.prototype.newMessageChunk = function (msgDataChunk) {
    const bufMsgDataChunk = Buffer.from(msgDataChunk, this.encoding);
    this.message = Buffer.concat([this.message, bufMsgDataChunk]);

    this.bytesCount += bufMsgDataChunk.length;
};

// Used when reading messages in chunks from Catenis

/**
 * Gets the accumulated (supposedly complete) message. Used when reading messages in chunks from Catenis
 *
 * @returns {string} The accumulated message encoded in the text encoding specified when the MessageChunker
 *  object was instantiated
 */
MessageChunker.prototype.getMessage = function () {
    return this.message.toString(this.encoding);
};

/**
 * Gets the total number of bytes of message currently computed
 *
 * @returns {number} Total number of bytes of message currently computed
 */
MessageChunker.prototype.getBytesCount = function () {
    return this.bytesCount;
};

module.exports = MessageChunker;
