function highlightMatch(value, filter) {
    let result = `${value}`;

    if (value && filter.value) {
        const regex = new RegExp(filter.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        result = result.replace(regex, match => `<mark>${match}</mark>`);
    }

    return result;
}

function toTitleCase(string) {
    return string.toLowerCase().replace(/\b\S/g, (character) => character.toUpperCase());
}

export {toTitleCase, highlightMatch}