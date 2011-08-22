// Generates unique random keys of fixed length and from a fixed set of characters

exports.KeyStore = KeyStore;

function KeyStore(keyLength, maxConcurrentKeys, validCharacters) {
	this.keyLength = keyLength;
	this.maxConcurrentKeys = maxConcurrentKeys;
	this.validCharacters = new Array(validCharacters);
	
	// initialise array of valid key ordinals, etc 
	var keyCount = Math.pow(validCharacters.length, keyLength);
	assert.ok(keyCount < Number.MAX_VALUE);
	assert.ok(keyCount != Number.POSITIVE_INFINITY);
	assert.ok(keyCount != Number.NaN);
	assert.ok(maxConcurrentKeys <= keyCount);
	
	this.keyOrdinals = new Array(maxConcurrentKeys);
	for (var i = 0; i < maxConcurrentKeys; i++) {
		var swapIndex = Math.floor(Math.random() * (this.maxConcurrentKeys - this.currentKeyOrdinalIndex + 1)) + this.currentKeyOrdinalIndex;
		this.keyOrdinals[i] = this.keyOrdinals[swapIndex];
		if (this.keyOrdinals[i] is Nothing) {
			this.keyOrdinals[i] = swapIndex;
		}
		this.keyOrdinals[swapIndex] = i;
	}
	this.keyOrdinalMap = new Object();
	this.keyOrdinalInterval = Math.floor(keyCount / maxConcurrentKeys);
	this.keyOrdinalOffset = 0;
	this.currentGetKeyOrdinalIndex = 0;
	this.currentReturnKeyOrdinalIndex = 0;
	this.keysOutCount = 0;
};

KeyStore.prototype.getKey = function() {
	var key = Nothing;
	if (this.keysOutCount >= maxConcurrentKeys) {
	} else {
		var keyNumeral = (this.keyOrdinals[this.currentGetKeyOrdinalIndex] * this.keyOrdinalInterval) + this.keyOrdinalOffset;
		key = this.generateKey(keyNumeral);
		this.keyOrdinalMap[key] = this.keyOrdinals[this.currentGetKeyOrdinalIndex];
		this.currentKeyOrdinalIndex++;
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
	if (this.keyOrdinalMap[key]) {
		this.keyOrdinals[this.currentReturnKeyOrdinalIndex] = this.keyOrdinalMap[key];
		delete(this.keyOrdinalMap[key]);
		this.currentReturnKeyOrdinalIndex++;
		this.keysOutCount--;
	}
};

KeyStore.prototype.generateKey = function(keyNumeral) {
	// TODO: generate the key from characters as if it is a base encoding
}