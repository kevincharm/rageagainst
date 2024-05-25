import { getDappConfig, getDappStatus } from '../../launcher'
import type { DappStatusOptions, DappStatusResult } from '../../../common/types/DappStatus'
import { ipcMain } from 'electron'

export default async function setup() {
    ipcMain.handle(
        'dapp:status',
        async (_, { dappUid }: DappStatusOptions): Promise<DappStatusResult> => {
            const status = await getDappStatus(dappUid)
            const config = await getDappConfig(dappUid)
            return {
                status,
                dappUrl: `http://localhost:${config.dapp.httpPort}`,
            }
        },
    )
}
