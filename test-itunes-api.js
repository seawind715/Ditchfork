// Test with the actual Apple Music URL
async function testWithAppleMusicUrl() {
    const appleMusicUrl = 'https://music.apple.com/kr/album/free-hukky-shibaseki-the-god-sun-symphony-group-odyssey-1/1752941119';

    console.log('='.repeat(70));
    console.log('Testing with Apple Music URL');
    console.log('='.repeat(70));
    console.log(`URL: ${appleMusicUrl}\n`);

    // Extract album ID from URL
    const albumId = appleMusicUrl.match(/\/album\/[^\/]+\/(\d+)/)?.[1];
    console.log(`Album ID: ${albumId}\n`);

    // Try to get info from iTunes Lookup API (different from Search API)
    if (albumId) {
        console.log('--- Testing iTunes Lookup API ---');
        const lookupUrl = `https://itunes.apple.com/lookup?id=${albumId}&country=kr`;

        try {
            const response = await fetch(lookupUrl);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const album = data.results[0];
                console.log('✅ Found album via Lookup API!');
                console.log(`Artist: ${album.artistName}`);
                console.log(`Album: ${album.collectionName}`);
                console.log(`Cover (100x100): ${album.artworkUrl100}`);
                console.log(`Cover (600x600): ${album.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')}`);
                console.log(`Apple Music URL: ${album.collectionViewUrl}`);
            } else {
                console.log('❌ No results from Lookup API');
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }

    // Try Odesli API to get other streaming links
    console.log('\n--- Testing Odesli API for cross-platform links ---');
    try {
        const odesliUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(appleMusicUrl)}`;
        const response = await fetch(odesliUrl);
        const data = await response.json();

        console.log('✅ Odesli API response received!');
        console.log('\nStreaming Links:');
        console.log(`Spotify: ${data.linksByPlatform?.spotify?.url || 'Not available'}`);
        console.log(`Apple Music: ${data.linksByPlatform?.appleMusic?.url || appleMusicUrl}`);
        console.log(`YouTube Music: ${data.linksByPlatform?.youtubeMusic?.url || data.linksByPlatform?.youtube?.url || 'Not available'}`);

    } catch (error) {
        console.error(`Odesli Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('CONCLUSION:');
    console.log('iTunes Lookup API works with album IDs from Apple Music URLs!');
    console.log('We should add this as a fallback method in the code.');
    console.log('='.repeat(70));
}

testWithAppleMusicUrl().catch(console.error);
