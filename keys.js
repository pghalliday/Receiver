// Generates unique random keys of fixed length and from a fixed set of characters
exports.KeyStore = KeyStore;

function KeyStoreException(summary, detail) {
    this.summary = summary;
    this.detail = detail;
}

function KeyStore(keyLength, validCharacters) {
    this.keyLength = keyLength;
    this.validCharacters = validCharacters.slice(0);

    // initialise array of valid key ordinals, etc
    this.keyCount = Math.pow(validCharacters.length, keyLength);
    if (this.keyCount == Number.MAX_VALUE) {
        throw new KeyStoreException('Too many keys', 'the total number of possible keys is equal to or exceeds the maximum number value');
    }
    if (this.keyCount == Number.POSITIVE_INFINITY) {
        throw new KeyStoreException('Infinite keys', 'the total number of possible keys seems to be positive infinity... which is odd');
    }
    if (this.keyCount == Number.NaN) {
        throw new KeyStoreException('Undefined number of keys', 'the total number of possible keys is not a number... which is odd');
    }

    this.keyOrdinals = [];
    this.keyOrdinalsInUse = {};
    this.keyOrdinalsInUseCount = 0;
    this.assignKeyOrdinalIndex = 0;
    this.unassignKeyOrdinalIndex = 0;
};

KeyStore.prototype.assignKey = function() {
    var key = null;
    if (this.keyOrdinalsInUseCount < this.keyCount) {

        // always pick a random key from those not currently in use and reserve it
        var swapKeyOrdinal = this.keyOrdinals[this.assignKeyOrdinalIndex];
        var assignRangeSize = (((this.keyCount + this.unassignKeyOrdinalIndex - this.assignKeyOrdinalIndex) - 1) % this.keyCount) + 1;
        var swapIndex = (Math.floor(Math.random() * assignRangeSize) + this.assignKeyOrdinalIndex) % this.keyCount;
        
        keyOrdinal = this.keyOrdinals[swapIndex];
        
        // initialise keys that haven't been initilaised yet
        if (keyOrdinal == null) {
            keyOrdinal = swapIndex;
        }
        if (swapKeyOrdinal == null) {
            swapKeyOrdinal = this.assignKeyOrdinalIndex;
        }        
        this.keyOrdinals[swapIndex] = swapKeyOrdinal;
        this.keyOrdinals[this.assignKeyOrdinalIndex] = keyOrdinal;
        
        // move to the next key for the next call to assignKey
        this.assignKeyOrdinalIndex++;
        this.assignKeyOrdinalIndex %= this.keyCount;
        
        // generate the key from the ordinal and record it as in use
        key = this.generateKey(keyOrdinal);
        this.keyOrdinalsInUse[key] = keyOrdinal;
        this.keyOrdinalsInUseCount++;
    }
   return key;
};

KeyStore.prototype.unassignKey = function(key) {
    // first check if the key is in use
    if (this.keyOrdinalsInUse[key] != null) {
        // return the ordinal to the ordinals array
        this.keyOrdinals[this.unassignKeyOrdinalIndex] = this.keyOrdinalsInUse[key];
        // unmark the ordinal as in use
        delete(this.keyOrdinalsInUse[key]);
        this.keyOrdinalsInUseCount--;
        
        // move to the next key for the next call to unassignKey
        this.unassignKeyOrdinalIndex++;
        this.unassignKeyOrdinalIndex %= this.keyCount;
    }
};

KeyStore.prototype.generateKey = function(keyOrdinal) {
    var key = "";
    var characterIndex = 0;
    var remainder = keyOrdinal;
    var divisor = 0;
    var length = this.validCharacters.length;
    for (var i = this.keyLength - 1; i > 0; i--) {
        divisor = Math.pow(length, i);
        characterIndex = Math.floor(remainder / divisor);
        remainder -= (divisor * characterIndex);
        key += this.validCharacters[characterIndex];
    }
    key += this.validCharacters[remainder];
    return key;
};