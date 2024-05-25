import { stop } from '../../launcher'
import type { DappStopOptions } from '../../../common/types/DappStop'
import { ipcMain } from 'electron'

export default async function setup() {
    ipcMain.handle('dapp:stop', async (_, { dappUid }: DappStopOptions) => {
        await stop(dappUid)
    })
}
