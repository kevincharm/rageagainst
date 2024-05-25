import { DappConfig } from './DappConfigSchema'

interface DappListResultSuccess {
    status: 'success'
    dapps: DappConfig[]
}

interface DappListResultError {
    status: 'error'
    error: string
}

export type DappListResult = DappListResultSuccess | DappListResultError
