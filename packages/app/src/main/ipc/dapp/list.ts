import { updateDappDefs } from '../../launcher'
import type { DappListResult } from '../../../common/types/DappList'
import { ipcMain } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { DappConfigSchema } from '../../../common/types/DappConfigSchema'
import { parse as parseToml } from 'smol-toml'

export default async function setup() {
    ipcMain.on('dapp:list', async (event) => {
        const dappDefsPath = await updateDappDefs()
        const dappUids = await fs
            .readdir(dappDefsPath)
            .then((files) => files.filter((file) => !file.startsWith('.')))
        const configs = await Promise.all(
            dappUids.map(async (dappUid) => {
                const configPath = path.resolve(dappDefsPath, `${dappUid}/nixpacks.toml`)
                return DappConfigSchema.parse(
                    parseToml(
                        await fs.readFile(configPath, {
                            encoding: 'utf-8',
                        }),
                    ),
                )
            }),
        )

        event.reply('dapp:list', {
            status: 'success',
            dapps: configs,
        } satisfies DappListResult)
    })
}
