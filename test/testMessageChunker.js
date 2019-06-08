const MessageChunker = require('../index.js').MessageChunker;
const expect = require('chai').expect;

describe('Catenis MessageChunker', function () {
    // Message 130 bytes long
    const message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et tortor accumsan, efficitur neque vel, sollicitudin justo nullam.";
    const msgChunks = [];

    it('break message in chunks to send', function () {
        const msgChunker = new MessageChunker(Buffer.from(message), 32);

        expect(msgChunker.message.toString()).to.be.equal(message);
        expect(msgChunker.maxChunkSize).to.be.equal(32);

        // Get all message chunks
        let msgChunk;

        while ((msgChunk = msgChunker.nextMessageChunk()) !== undefined) {
            msgChunks.push(msgChunk);
        }

        expect(msgChunks).to.have.lengthOf(6);
    });

    it('assemble chunks of received message', function () {
        const msgChunker = new MessageChunker('base64');

        msgChunks.forEach(msgChunk => msgChunker.newMessageChunk(msgChunk));

        const assembledMessage = Buffer.from(msgChunker.getMessage(), 'base64').toString();

        expect(assembledMessage).to.equal(message);
        expect(msgChunker.getBytesCount()).to.equal(message.length);
    });
});
