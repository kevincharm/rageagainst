import { useEffect, useState } from 'react'
import type { DappRunLaunchedResult, DappRunOptions } from '../../../common/types/DappRun'

interface DappLauncherButtonProps {
    dappUid: string
}

export function DappLauncherButton({ dappUid }: DappLauncherButtonProps) {
    const [runCorrId, setRunCorrId] = useState<string | null>(null)
    const [runError, setRunError] = useState<string>('')
    const [isBuilding, setIsBuilding] = useState<boolean>(false)
    const [dappUrl, setDappUrl] = useState<string>('')
    const isRunning = !!dappUrl

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
            }
        })

        return () => {
            window.electron.ipcRenderer.removeAllListeners('dapp:launched')
        }
    }, [runCorrId])

    const runDapp = () => {
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
            <button onClick={runDapp} disabled={isBuilding || isRunning}>
                Launch
            </button>
            {runError && <div>{runError}</div>}
            {isRunning && (
                <div>
                    <a target="_blank" href={dappUrl}>
                        Launch in browser
                    </a>
                </div>
            )}
        </div>
    )
}
