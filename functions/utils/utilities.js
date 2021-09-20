


exports.keyArray = (name) => {
    let keys = [];
    const words = name.toLowerCase().split(" ");
    words.forEach(word => {
        const letters = word.split("");
        let key = "";
        letters.forEach(letter => {
            key += letter;
            keys.push(key);
        });
    });

    return keys;
}

exports.trimSpaces = (name) => {
    return name.replace(/\s\s+/g, ' ').trim();
}

exports.isValidUrl = (string) => {
    try {
      new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;  
    }
  }