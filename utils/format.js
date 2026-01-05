/**
 * Converts a string to Title Case.
 * Example: "abbey road" -> "Abbey Road", "THE BEATLES" -> "The Beatles"
 */
export function toTitleCase(str) {
    if (!str) return str;
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
