import { useEffect, useState } from 'react'
import type { DappRunLaunchedResult, DappRunOptions } from '../../../common/types/DappRun'
import { DappStatusOptions, DappStatusResult } from 'src/common/types/DappStatus'
import { DappStopOptions } from 'src/common/types/DappStop'
import { StopCircleIcon } from '@heroicons/react/20/solid'
import { DappConfig } from 'src/common/types/DappConfigSchema'

interface DappLauncherButtonProps {
    config: DappConfig
}

export function DappLauncherButton({ config }: DappLauncherButtonProps) {
    const [runCorrId, setRunCorrId] = useState<string | null>(null)
    const [runError, setRunError] = useState<string>('')
    const [isBuilding, setIsBuilding] = useState<boolean>(false)
    const [dappUrl, setDappUrl] = useState<string>('')
    const [dappStatus, setDappStatus] = useState<'running' | 'stopped' | 'nonexistent' | 'unknown'>(
        'unknown',
    )
    const dappUid = config.dapp.uid

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

    const stopDapp = async () => {
        await setDappStatus('unknown')
        await window.electron.ipcRenderer.invoke('dapp:stop', {
            dappUid,
        } satisfies DappStopOptions)
        refreshDappStatus()
    }

    const handleClick = async () => {
        if (dappStatus === 'running' && dappUrl) {
            window.open(dappUrl, '_blank')
        } else if (dappStatus === 'stopped') {
            await runDapp()
            window.open(dappUrl, '_blank')
        } else if (dappStatus === 'nonexistent') {
            await runDapp()
        }
    }

    const isLoading = dappStatus === 'unknown' || isBuilding
    const iconUri =
        config.dapp.iconUri ||
        'https://upload.wikimedia.org/wikipedia/commons/2/2f/Tornado_cash_logo.jpg' /** TODO */

    return (
        <li className="relative">
            <div className="dapp-button-container relative p-8 hover:backdrop-blur-md hover:bg-white/30 group block w-full overflow-hidden rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                {dappStatus === 'running' && (
                    <div className="actions">
                        <button
                            className="z-10 absolute top-0 right-0 p-2 text-white"
                            onClick={async () => {
                                await stopDapp()
                            }}
                        >
                            <StopCircleIcon className="h-8 w-8" />
                        </button>
                    </div>
                )}
                <div onClick={handleClick} className="z-10 relative">
                    {isLoading ? (
                        <>
                            <img
                                src={iconUri}
                                alt=""
                                className="brightness-50 w-[4rem] rounded-2xl m-auto pointer-events-none object-cover group-hover:opacity-75 group-hover:scale-110 transition ease-linear shadow-lg"
                            />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="text-center">
                                    <div role="status">
                                        <svg
                                            aria-hidden="true"
                                            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                            viewBox="0 0 100 101"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentFill"
                                            />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <img
                            src={iconUri}
                            alt=""
                            className="w-[4rem] rounded-2xl m-auto pointer-events-none object-cover group-hover:opacity-75 group-hover:scale-110 transition ease-linear shadow-lg"
                        />
                    )}
                </div>
                <button type="button" className="absolute inset-0 focus:outline-none">
                    <span className="sr-only">View details for {dappUid}</span>
                </button>
                <p className="pointer-events-none mt-4 block truncate text-center text-sm font-medium text-gray-900 group-hover:scale-105 transition ease-linear">
                    {config.dapp.displayName || dappUid}
                </p>
                <p className="pointer-events-none block text-sm text-center font-medium text-gray-500 group-hover:scale-105 transition ease-linear">
                    {config.dapp.tag || 'latest'}
                </p>
            </div>
        </li>
    )
}
