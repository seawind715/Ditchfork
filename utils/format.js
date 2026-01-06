export function toTitleCase(str) {
    if (!str) return str;
    return str.split(' ').map(word => {
        // 1. Preserve mixed case (e.g. "NewJeans", "K-Pop", "iOS", "e-Sens")
        // If a word contains both uppercase and lowercase letters, assume user intended specific casing.
        if (/[a-z]/.test(word) && /[A-Z]/.test(word)) {
            return word;
        }

        // 2. Handle hyphens for simple words (e.g. "k-pop" -> "K-Pop", "hip-hop" -> "Hip-Hop")
        // This runs if the word was NOT mixed case (i.e., all lower or all upper).
        if (word.includes('-')) {
            return word.split('-').map(part =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            ).join('-');
        }

        // 3. Standard Title Case for simple words (e.g. "new" -> "New", "ROCK" -> "Rock")
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}
