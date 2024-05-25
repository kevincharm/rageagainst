interface DappListResultSuccess {
    status: 'success'
    dappUids: string[]
}

interface DappListResultError {
    status: 'error'
    error: string
}

export type DappListResult = DappListResultSuccess | DappListResultError
