import { launch } from '../../launcher'
import type { DappRunLaunchedResult, DappRunOptions } from '../../../common/types/DappRun'
import { ipcMain } from 'electron'

export default async function setup() {
    ipcMain.on('dapp:run', async (event, { corrId, dappUid, shouldReset }: DappRunOptions) => {
        const dappUrl = await launch(dappUid, shouldReset)
        event.reply('dapp:launched', {
            status: 'success',
            corrId,
            dappUrl,
        } satisfies DappRunLaunchedResult)
    })
}
