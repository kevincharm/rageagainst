import { useEffect, useState } from 'react'
import type { DappRunLaunchedResult, DappRunOptions } from '../../../common/types/DappRun'
import { DappStatusOptions, DappStatusResult } from 'src/common/types/DappStatus'

interface DappLauncherButtonProps {
    dappUid: string
}

export function DappLauncherButton({ dappUid }: DappLauncherButtonProps) {
    const [runCorrId, setRunCorrId] = useState<string | null>(null)
    const [runError, setRunError] = useState<string>('')
    const [isBuilding, setIsBuilding] = useState<boolean>(false)
    const [dappUrl, setDappUrl] = useState<string>('')
    const [dappStatus, setDappStatus] = useState<'running' | 'stopped' | 'nonexistent' | 'unknown'>(
        'unknown',
    )

    const refreshDappStatus = async () =>
        window.electron.ipcRenderer
            .invoke('dapp:status', {
                dappUid,
            } satisfies DappStatusOptions)
            .then((result: DappStatusResult) => {
                setDappStatus(result.status)
                setDappUrl(result.dappUrl)
                return result
            })
    // Run on startup
    useEffect(() => {
        refreshDappStatus()
    }, [])

    useEffect(() => {
        window.electron.ipcRenderer.on('dapp:launched', (_, result: DappRunLaunchedResult) => {
            console.log('dapp:launched', result)
            console.log('expected corrid', runCorrId)
            if (result.corrId !== runCorrId) return // not for this one

            setRunCorrId(null)
            if (result.status === 'error') {
                console.error(`Dapp ${dappUid} failed to launch with error: ${result.error}`)
                setRunError(result.error)
            } else {
                setIsBuilding(false)
                setDappUrl(result.dappUrl)
                refreshDappStatus()
            }
        })

        return () => {
            window.electron.ipcRenderer.removeAllListeners('dapp:launched')
        }
    }, [runCorrId])

    const runDapp = async () => {
        const statusResult = await refreshDappStatus()
        if (isBuilding || statusResult.status === 'running') return // disabled

        setRunCorrId((corrId) => {
            if (corrId) return corrId // do nothing

            const newCorrId = crypto.randomUUID()
            setIsBuilding(true)
            window.electron.ipcRenderer.send('dapp:run', {
                corrId: newCorrId,
                dappUid,
            } satisfies DappRunOptions)
            return newCorrId
        })
    }

    return (
        <div onClick={runDapp}>
            <h2>{dappUid}</h2>
            {runError && <div>{runError}</div>}
            <div>
                {dappStatus === 'running' && dappUrl ? (
                    <a target="_blank" href={dappUrl}>
                        <button>Launch in browser</button>
                    </a>
                ) : (
                    <button onClick={runDapp} disabled={isBuilding || dappStatus === 'running'}>
                        Launch
                    </button>
                )}
            </div>
        </div>
    )
}
