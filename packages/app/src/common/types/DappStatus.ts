export interface DappStatusOptions {
    dappUid: string
}

export interface DappStatusResult {
    status: 'running' | 'stopped' | 'nonexistent'
    dappUrl: string
}
