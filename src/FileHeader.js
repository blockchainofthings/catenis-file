const crypto = require('crypto');

const salt = 'CTN_FILE_METADATA';
const checksumLength = 7;

const FileHeader = {};

/**
 * Prepends a file metadata header to file contents
 *
 * @param fileInfo {{fileName: string, fileType: string, fileContents: Buffer}} Object containing information
 *  about the file
 * @returns {Buffer} The modified contents of the file including the file metadata header
 */
FileHeader.encode = function (fileInfo) {
    const fileMeta = {
        fn: fileInfo.fileName,      // File name
        mt: fileInfo.fileType       // MIME type
    };

    const header = JSON.stringify(fileMeta) + '\n';
    const checksum = computeChecksum(header);

    return Buffer.concat([
        Buffer.from(checksum + header),
        fileInfo.fileContents
    ]);
};

/**
 * Extracts original file contents and other information about the file given a modified contents with a prepended
 *  file metadata header
 *
 * @param fileContents {Buffer} Modified contents of the file with prepended file metadata header
 * @returns {null|{fileName: string, fileType: string, fileContents: Buffer}} Object containing information about
 *  the file including its original contents (without the metadata header)
 */
FileHeader.decode = function (fileContents) {
    const firstLineEndPos = fileContents.indexOf('\n');

    if (firstLineEndPos > checksumLength + 1) {
        const firstLine = fileContents.toString('utf8', 0, firstLineEndPos + 1);
        const checksum = firstLine.substring(0, checksumLength);
        const header = firstLine.substring(checksumLength);
        let fileMeta;

        try {
            // Exclude trailing new line character
            fileMeta = JSON.parse(header.substring(0, header.length - 1));
        }
        catch (err) {}

        if (isValidFileMeta(fileMeta) && checksum === computeChecksum(header)) {
            return {
                fileName: fileMeta.fn,
                fileType: fileMeta.mt,
                fileContents: fileContents.slice(firstLineEndPos + 1)
            }
        }
    }

    return null;
};

function computeChecksum(header) {
    return crypto.createHash('sha1').update(salt + header).digest('hex').substring(0, checksumLength);
}

function isValidFileMeta(fileMeta) {
    let result = false;

    if (typeof fileMeta === 'object' && fileMeta !== null) {
        const validKeys = {
            fn: true,
            mt: true
        };

        result = !Object.keys(fileMeta).some(function (key) {
            return !(key in validKeys);
        });
    }

    return result;
}

module.exports = FileHeader;
