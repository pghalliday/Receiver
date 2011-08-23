// Generates unique random keys of fixed length and from a fixed set of characters
exports.KeyStore = KeyStore;

function KeyStoreException(summary, detail) {
    this.summary = summary;
    this.detail = detail;
}

function KeyStore(keyLength, maxConcurrentKeys, validCharacters) {
    this.keyLength = keyLength;
    this.maxConcurrentKeys = maxConcurrentKeys;
    this.validCharacters = validCharacters.slice(0);

    // initialise array of valid key ordinals, etc
    var keyCount = Math.pow(validCharacters.length, keyLength);
    if (keyCount == Number.MAX_VALUE) {
        throw new KeyStoreException('Too many keys', 'the total number of possible keys is equal to or exceeds the maximum number value');
    }
    if (keyCount == Number.POSITIVE_INFINITY) {
        throw new KeyStoreException('Infinite keys', 'the total number of possible keys seems to be positive infinity... which is odd');
    }
    if (keyCount == Number.NaN) {
        throw new KeyStoreException('Undefined number of keys', 'the total number of possible keys is not a number... which is odd');
    }
    if (maxConcurrentKeys > keyCount) {
        throw new KeyStoreException('Too many concurrent keys', 'The maximum number of concurrent keys is greater than the total number of possible keys');
    }

    this.keyOrdinals = new Array(maxConcurrentKeys);
	var swapIndex = 0;
	var swapValue = 0;
    for (var i = 0; i < maxConcurrentKeys; i++) {
        this.keyOrdinals[i] = i;
    }
    for (var i = 0; i < maxConcurrentKeys - 1; i++) {
        swapIndex = Math.floor(Math.random() * (maxConcurrentKeys - i)) + i;
		swapValue = this.keyOrdinals[i]
        this.keyOrdinals[i] = this.keyOrdinals[swapIndex];
        this.keyOrdinals[swapIndex] = swapValue;
    }
    this.keyOrdinalMap = new Object();
    this.keyOrdinalInterval = Math.floor(keyCount / maxConcurrentKeys);
    this.keyOrdinalOffset = 0;
    this.currentGetKeyOrdinalIndex = 0;
    this.currentReturnKeyOrdinalIndex = 0;
    this.keysOutCount = 0;
};

KeyStore.prototype.getKey = function() {
    var key = null;
    if (this.keysOutCount < this.maxConcurrentKeys) {
        var keyNumeral = (this.keyOrdinals[this.currentGetKeyOrdinalIndex] * this.keyOrdinalInterval) + this.keyOrdinalOffset;
        key = this.generateKey(keyNumeral);
        this.keyOrdinalMap[key] = this.keyOrdinals[this.currentGetKeyOrdinalIndex];
        this.currentGetKeyOrdinalIndex++;
        if (this.currentGetKeyOrdinalIndex >= this.maxConcurrentKeys) {
            this.currentGetKeyOrdinalIndex = 0;
            this.keyOrdinalOffset++;
            if (this.keyOrdinalOffset >= this.keyOrdinalInterval) {
                this.keyOrdinalOffset = 0;
            }
        }
        this.keysOutCount++;
    }
    return key;
};

KeyStore.prototype.returnKey = function(key) {
    if (this.keyOrdinalMap[key] != null) {
        this.keyOrdinals[this.currentReturnKeyOrdinalIndex] = this.keyOrdinalMap[key];
        delete(this.keyOrdinalMap[key]);
        this.currentReturnKeyOrdinalIndex++;
        if (this.currentReturnKeyOrdinalIndex >= this.maxConcurrentKeys) {
            this.currentReturnKeyOrdinalIndex = 0;
        }
        this.keysOutCount--;
    }
};

KeyStore.prototype.generateKey = function(keyNumeral) {
    var key = "";
    var characterIndex = 0;
    var remainder = keyNumeral;
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