export function toTitleCase(str) {
    if (!str) return str;
    return str.split(' ').map(word => {
        // 1. Preserve mixed case (e.g. "NewJeans", "K-Pop", "iOS")
        if (/[a-z]/.test(word) && /[A-Z]/.test(word)) {
            return word;
        }

        // 2. Preserve All-Caps Acronyms (e.g. "NCT", "RM", "UK", "USA")
        // Check if word is all uppercase and length > 1 (avoid "A" being treated as acronym if desired, though "I" is usually fine)
        // Also ensure it has at least one letter to avoid triggering on numbers only if mixed (though regex above handles mixed)
        // Actually, simple check: if it's already all upper, keep it.
        // BUT logic 3 below forces lowercase for "ROCK". The user WANTs "ROCK" if they typed it? 
        // User said: "When name/artist is just ALL CAPS... it shouldn't be forced".
        // So if the input word is fully uppercase, we return it as is.
        if (word === word.toUpperCase() && word.length > 1) {
            return word;
        }

        // 3. Handle hyphens (e.g. "k-pop" -> "K-Pop")
        if (word.includes('-')) {
            return word.split('-').map(part =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            ).join('-');
        }

        // 4. Standard Title Case for everything else (e.g. "rock" -> "Rock")
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}
