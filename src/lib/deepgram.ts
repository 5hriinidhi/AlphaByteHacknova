import { DEEPGRAM_CONFIG } from './deepgram-config';

export class DeepgramClient {
    private socket: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private processor: ScriptProcessorNode | null = null;
    private mediaStream: MediaStream | null = null;
    private onTextCallback: (text: string, isFinal: boolean) => void;
    private onErrorCallback: (error: string) => void;

    constructor(
        onText: (text: string, isFinal: boolean) => void,
        onError: (error: string) => void
    ) {
        this.onTextCallback = onText;
        this.onErrorCallback = onError;
    }

    private getWebSocketUrl(): string {
        return `wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&model=general&smart_format=true`;
    }

    public start() {
        const apiKey = DEEPGRAM_CONFIG.API_KEY;
        if (!apiKey) {
            console.error('Missing Deepgram API Key');
            this.onErrorCallback('Missing Deepgram API Key');
            return;
        }

        try {
            const url = this.getWebSocketUrl();
            console.log('Connecting to Deepgram...');

            this.socket = new WebSocket(url, ['token', apiKey]);

            this.socket.onopen = () => {
                console.log('✅ Deepgram Connected');
                this.startRecording();
            };

            this.socket.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);

                    if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
                        const transcript = data.channel.alternatives[0].transcript;
                        const isFinal = data.is_final;

                        if (transcript && transcript.trim().length > 0) {
                            // Only log text for privacy/cleanliness
                            // console.log('📝 Transcription:', transcript);
                            this.onTextCallback(transcript, isFinal);
                        }
                    }
                } catch (err) {
                    console.error('Error parsing Deepgram message:', err);
                }
            };

            this.socket.onerror = (e) => {
                console.error('WebSocket Error:', e);
                this.onErrorCallback('Connection Error');
            };

            this.socket.onclose = (e) => {
                console.log(`WebSocket Closed. Code: ${e.code}, Reason: ${e.reason}`);
                if (e.code === 1006) {
                    this.onErrorCallback('Connection Failed (1006). If this persists, check Firewall/VPN.');
                }
                this.stopRecording();
            };

        } catch (error) {
            console.error('Initialization Error:', error);
            this.onErrorCallback('Failed to initialize connection');
        }
    }

    private async startRecording() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Microphone access not supported');
            }

            // Using standard constraints now that we know it's a mute issue
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            const track = this.mediaStream.getAudioTracks()[0];
            const deviceLabel = track.label || 'Unknown Device';

            console.log(`🎤 Microphone initialized: "${deviceLabel}"`);

            // CRITICAL CHECK FOR HARDWARE MUTE
            if (track.muted) {
                console.error('🚨 YOUR MICROPHONE IS SYSTEM-MUTED! Please unmute your hardware/OS settings.');
                this.onErrorCallback('Microphone is MUTED by Windows/Hardware. Please Unmute.');
                return;
            }

            // Monitor for mute toggles during use
            track.onmute = () => {
                console.warn('🎤 Microphone was MUTED by system');
                this.onErrorCallback('Microphone Muted');
            };
            track.onunmute = () => {
                console.log('🎤 Microphone Unmuted');
            };

            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.processor.onaudioprocess = (e) => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const audioData = this.transcodeAudio(inputData);
                    this.socket.send(audioData.buffer);
                }
            };

            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);
        } catch (error) {
            console.error('Microphone access denied:', error);
            this.onErrorCallback('Microphone access denied');
        }
    }

    private transcodeAudio(inputData: Float32Array): Int16Array {
        const targetRate = 16000;
        const sampleRate = this.audioContext?.sampleRate || 44100;
        const compression = sampleRate / targetRate;
        const length = inputData.length / compression;
        const result = new Int16Array(length);

        for (let i = 0, j = 0; i < length; i++, j += compression) {
            const s = Math.max(-1, Math.min(1, inputData[Math.floor(j)]));
            result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        return result;
    }

    private stopRecording() {
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    public stop() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }
        this.socket = null;
        this.stopRecording();
    }
}
