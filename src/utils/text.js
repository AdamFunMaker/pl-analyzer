function toTitleCase(string) {
    return string.toLowerCase().replace(/\b\S/g, (character) => character.toUpperCase());
}

export {toTitleCase}