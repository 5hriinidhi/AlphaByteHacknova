import CryptoJS from 'crypto-js';
import { getIFlytekConfig } from './iflytek-config';

export class IFlytekClient {
    private socket: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private processor: ScriptProcessorNode | null = null;
    private mediaStream: MediaStream | null = null;
    private onTextCallback: (text: string, isFinal: boolean) => void;
    private onErrorCallback: (error: string) => void;
    private isFirstFrame = true;

    constructor(
        onText: (text: string, isFinal: boolean) => void,
        onError: (error: string) => void
    ) {
        this.onTextCallback = onText;
        this.onErrorCallback = onError;
    }

    private getWebSocketUrl(): string {
        const { apiSecret, apiKey } = getIFlytekConfig();

        const url = 'wss://iat-api.xfyun.cn/v2/iat';
        const host = 'iat-api.xfyun.cn';
        const date = new Date().toUTCString();
        const algorithm = 'hmac-sha256';
        const headers = 'host date request-line';
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;

        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
        const signature = CryptoJS.enc.Base64.stringify(signatureSha);

        const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
        const authorization = btoa(authorizationOrigin);

        return `${url}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
    }

    public start() {
        const { appId, apiSecret, apiKey } = getIFlytekConfig();

        if (!appId || !apiSecret || !apiKey) {
            console.error('Missing iFlytek credentials');
            this.onErrorCallback('Credentials missing. Check iflytek-config.ts');
            return;
        }

        try {
            const url = this.getWebSocketUrl();
            console.log('Connecting to iFlytek...');
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log('✅ iFlytek Connected');
                this.isFirstFrame = true;
                this.startRecording();
            };

            this.socket.onmessage = (e) => {
                const jsonData = JSON.parse(e.data);
                if (jsonData.code !== 0) {
                    console.error(`iFlytek API Error: ${jsonData.code} ${jsonData.message}`);
                    this.onErrorCallback(`Error ${jsonData.code}: ${jsonData.message}`);
                    this.socket?.close();
                    return;
                }

                if (jsonData.data && jsonData.data.result) {
                    const result = jsonData.data.result;
                    const ws = result.ws;
                    let str = '';
                    ws.forEach((item: any) => {
                        item.cw.forEach((w: any) => {
                            str += w.w;
                        });
                    });
                    this.onTextCallback(str, false);
                }
            };

            this.socket.onerror = (e) => {
                console.error('WebSocket Error:', e);
                // Don't trigger callback here immediately, wait for close code
            };

            this.socket.onclose = (e) => {
                console.log(`WebSocket Closed. Code: ${e.code}, Reason: ${e.reason}`);
                if (e.code === 1006) {
                    this.onErrorCallback('Connection Failed (1006). CHECK IP WHITELIST in console.');
                    console.error('🚨 1006 ERROR: This usually means your IP address is not whitelisted in the iFlytek Console.');
                } else if (e.code !== 1000) {
                    this.onErrorCallback(`Connection closed (${e.code})`);
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

            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
                    this.sendAudioData(audioData);
                }
            };

            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);
        } catch (error) {
            console.error('Microphone access denied:', error);
            this.onErrorCallback('Microphone access denied');
        }
    }

    private sendAudioData(audioData: string) {
        if (!this.socket) return;

        const { appId } = getIFlytekConfig();

        const params: any = {
            data: {
                status: 1, // 1 for continue
                format: 'audio/L16;rate=16000',
                encoding: 'raw',
                audio: audioData
            }
        };

        if (this.isFirstFrame) {
            params.common = { app_id: appId };
            params.business = {
                language: 'en_us',
                domain: 'iat',
                vad_eos: 5000,
            };
            params.data.status = 0; // 0 for start
            this.isFirstFrame = false;
        }

        this.socket.send(JSON.stringify(params));
    }

    private transcodeAudio(inputData: Float32Array): string {
        const targetRate = 16000;
        const sampleRate = this.audioContext?.sampleRate || 44100;
        const compression = sampleRate / targetRate;
        const length = inputData.length / compression;
        const result = new Int16Array(length);

        for (let i = 0, j = 0; i < length; i++, j += compression) {
            const s = Math.max(-1, Math.min(1, inputData[Math.floor(j)]));
            result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        const bytes = new Uint8Array(result.buffer);
        let binary = '';
        const len = bytes.byteLength;
        const CHUNK_SIZE = 8192;
        for (let i = 0; i < len; i += CHUNK_SIZE) {
            const end = Math.min(i + CHUNK_SIZE, len);
            for (let k = i; k < end; k++) {
                binary += String.fromCharCode(bytes[k]);
            }
        }
        return btoa(binary);
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
        this.isFirstFrame = true;
    }

    public stop() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const params = {
                data: {
                    status: 2,
                    format: 'audio/L16;rate=16000',
                    encoding: 'raw',
                    audio: ''
                }
            };
            try {
                this.socket.send(JSON.stringify(params));
            } catch (e) {
                // Ignore
            }
            this.socket.close();
        }
        this.socket = null;
        this.stopRecording();
    }
}
