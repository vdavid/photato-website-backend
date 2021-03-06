const crypto = require('crypto');

class HashProvider {
    /**
     * @param {string} string Any string to get its hash
     * @returns {string} The hash.
     */
    getSHA256Hash(string) {
        return crypto.createHash('sha256').update(string).digest('hex');
    }
}

module.exports = HashProvider;