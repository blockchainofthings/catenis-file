const FileHeader = require('../index.js').FileHeader;
const expect = require('chai').expect;

describe('Catenis FileHeader', function () {
    const fileInfo = {
        fileName: 'mytestfile.txt',
        fileType: 'text/plain',
        fileContents: Buffer.from('This is only a test.')
    };
    let modifiedFileContents;

    it('encoding', function() {
        modifiedFileContents = FileHeader.encode(fileInfo);

        expect(modifiedFileContents).to.be.an.instanceOf(Buffer).and.to.have.lengthOf.above(fileInfo.fileContents.length);
        expect(modifiedFileContents.toString()).to.match(/^[0-9A-Fa-f]{7}{"fn":"mytestfile\.txt","mt":"text\/plain"}\nThis is only a test\.$/g);
        expect(modifiedFileContents.toString().substring(0, 7)).to.be.equal('0bee76a');
    });

    it('decoding', function() {
       const decFileInfo = FileHeader.decode(modifiedFileContents);

       expect(decFileInfo).to.be.deep.equal(fileInfo);
    });
});