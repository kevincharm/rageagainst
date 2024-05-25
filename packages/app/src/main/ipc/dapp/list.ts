import { updateDappDefs } from '../../launcher'
import type { DappListResult } from '../../../common/types/DappList'
import { ipcMain } from 'electron'
import fs from 'node:fs/promises'

export default async function setup() {
    ipcMain.on('dapp:list', async (event) => {
        const dappDefsPath = await updateDappDefs()
        const dappUids = await fs
            .readdir(dappDefsPath)
            .then((files) => files.filter((file) => !file.startsWith('.')))
        event.reply('dapp:list', {
            status: 'success',
            dappUids,
        } satisfies DappListResult)
    })
}
