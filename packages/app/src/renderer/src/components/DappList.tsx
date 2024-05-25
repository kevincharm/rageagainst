import { useEffect, useState } from 'react'
import { DappListResult } from 'src/common/types/DappList'
import { DappLauncherButton } from './DappLauncherButton'

export function DappList() {
    const [dappUids, setDappUids] = useState<string[]>([])
    const [error, setError] = useState<string>('')

    useEffect(() => {
        window.electron.ipcRenderer.on('dapp:list', (_, result: DappListResult) => {
            if (result.status === 'error') {
                console.error('Failed to list dapps', result.error)
                setError(result.error)
            } else {
                setDappUids(result.dappUids)
            }
        })

        window.electron.ipcRenderer.send('dapp:list')

        return () => {
            window.electron.ipcRenderer.removeAllListeners('dapp:list')
        }
    }, [])

    return (
        <div>
            <div>
                {dappUids.map((dappUid) => (
                    <DappLauncherButton key={dappUid} dappUid={dappUid} />
                ))}
            </div>
            {error && <div>{error}</div>}
        </div>
    )
}
