export async function runNetworkDiagnostics() {
    console.log('🧪 Starting Network Diagnostics...');

    const results = {
        http: { status: 'pending', code: 0, message: '' },
        websocket: { status: 'pending', message: '' }
    };

    // 1. HTTP Connectivity Check
    try {
        console.log('Testing HTTP Reachability to api.deepgram.com...');
        // Using a public endpoint or just root to see if we get a response (even 404 is a success for reachability)
        const response = await fetch('https://api.deepgram.com/v1/projects', {
            method: 'GET',
            headers: {
                // Don't send auth here to separate auth errors from network errors
            }
        });

        results.http.code = response.status;
        if (response.status === 401) {
            results.http.status = 'success'; // Reachable!
            results.http.message = 'Server reachable (401 Unauthorized as expected)';
        } else {
            results.http.status = 'warning';
            results.http.message = `Server reachable but returned ${response.status}`;
        }
        console.log('✅ HTTP Test API Reachable:', results.http);
    } catch (e: any) {
        results.http.status = 'failure';
        results.http.message = e.message || 'Network request failed';
        console.error('❌ HTTP Connection Failed:', e);
    }

    return results;
}
