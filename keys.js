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

    this.keyOrdinals = new Array(this.keyCount);
    this.keyOrdinalMap = new Object();
    this.currentGetKeyOrdinalIndex = 0;
    this.currentReturnKeyOrdinalIndex = 0;
    this.randomizationComplete = false;
    this.keysOutCount = 0;
};

KeyStore.prototype.getKey = function() {
    var key = null;
    if (this.keysOutCount < this.keyCount) {
    	
    	  // randomize the keys if not already done
    	  if (!this.randomizationComplete) {
    	  		var swapIndex = Math.floor(Math.random() * (this.keyCount - this.currentGetKeyOrdinalIndex)) + this.currentGetKeyOrdinalIndex;
    	  		var swapValue = swapIndex;
    	  		if (this.keyOrdinals[swapIndex] != null) {
    	  			swapValue = this.keyOrdinals[swapIndex];
    	  		}
    	  		if (this.keyOrdinals[this.currentGetKeyOrdinalIndex] == null) {
    	  			this.keyOrdinals[this.currentGetKeyOrdinalIndex] = this.currentGetKeyOrdinalIndex;
    	  		}
    	  		this.keyOrdinals[swapIndex] = this.keyOrdinals[this.currentGetKeyOrdinalIndex];
    	  		this.keyOrdinals[this.currentGetKeyOrdinalIndex] = swapValue;
    	  		this.randomizationComplete = (this.currentGetKeyOrdinalIndex == (this.keyCount - 1));
    	  }
    	  
        key = this.generateKey(this.keyOrdinals[this.currentGetKeyOrdinalIndex]);
        this.keyOrdinalMap[key] = this.keyOrdinals[this.currentGetKeyOrdinalIndex];
        this.currentGetKeyOrdinalIndex++;
        if (this.currentGetKeyOrdinalIndex >= this.keyCount) {
            this.currentGetKeyOrdinalIndex = 0;
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
        if (this.currentReturnKeyOrdinalIndex >= this.keyCount) {
            this.currentReturnKeyOrdinalIndex = 0;
        }
        this.keysOutCount--;
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