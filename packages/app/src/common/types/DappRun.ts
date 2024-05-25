export interface DappRunOptions {
    corrId: string
    dappUid: string
    shouldReset?: boolean
}

interface DappRunLaunchedResultSuccess {
    status: 'success'
    dappUrl: string
}

interface DappRunLaunchedResultError {
    status: 'error'
    error: string
}

export type DappRunLaunchedResult = (DappRunLaunchedResultSuccess | DappRunLaunchedResultError) & {
    corrId: string
}
