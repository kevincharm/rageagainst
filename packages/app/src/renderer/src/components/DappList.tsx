import { useEffect, useState } from 'react'
import { DappListResult } from 'src/common/types/DappList'
import { DappLauncherButton } from './DappLauncherButton'
import logo from '../assets/rageagainsteu-star.svg'
import bg from '../assets/rageagainsteu-bg.png'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/20/solid'

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
        <div
            style={{
                backgroundImage: `url("${bg}")`,
            }}
            className="h-screen bg-cover bg-gradient-to-r from-cyan-500 to-blue-500"
        >
            <Disclosure as="nav" className="backdrop-blur-md bg-slate-500/30">
                {({ open }) => (
                    <>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-12 justify-between">
                                <div className="flex">
                                    <div className="-ml-2 mr-2 flex items-center md:hidden">
                                        {/* Mobile menu button */}
                                        <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                                            <span className="absolute -inset-0.5" />
                                            <span className="sr-only">Open main menu</span>
                                            {open ? (
                                                <XMarkIcon
                                                    className="block h-6 w-6"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <Bars3Icon
                                                    className="block h-6 w-6"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </DisclosureButton>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center">
                                        <img
                                            className="h-8 w-auto"
                                            src={logo}
                                            alt="local Dapp launcher"
                                        />
                                    </div>
                                    <div className="hidden md:ml-6 md:flex md:space-x-8">
                                        {/* Current: "border-blue-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                                        <a
                                            href="#"
                                            className="inline-flex items-center border-b-2 border-blue-300 px-1 pt-1 text-sm font-medium text-white"
                                        >
                                            All
                                        </a>
                                        <a
                                            href="#"
                                            className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-200 hover:border-blue-400 hover:text-blue-200"
                                        >
                                            DeFi
                                        </a>
                                        <a
                                            href="#"
                                            className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-200 hover:border-blue-400 hover:text-blue-200"
                                        >
                                            Custom
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <button
                                            type="button"
                                            className="relative inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                        >
                                            <PlusIcon
                                                className="-ml-0.5 h-5 w-5"
                                                aria-hidden="true"
                                            />
                                            Add dApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DisclosurePanel className="md:hidden">
                            <div className="space-y-1 pb-3 pt-2">
                                {/* Current: "bg-blue-50 border-blue-500 text-blue-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                                <DisclosureButton
                                    as="a"
                                    href="#"
                                    className="block border-l-4 border-blue-500 bg-blue-50 py-2 pl-3 pr-4 text-base font-medium text-blue-700 sm:pl-5 sm:pr-6"
                                >
                                    All
                                </DisclosureButton>
                                <DisclosureButton
                                    as="a"
                                    href="#"
                                    className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"
                                >
                                    DeFi
                                </DisclosureButton>
                                <DisclosureButton
                                    as="a"
                                    href="#"
                                    className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"
                                >
                                    Custom
                                </DisclosureButton>
                            </div>
                        </DisclosurePanel>
                    </>
                )}
            </Disclosure>
            <div className="mx-auto max-w-7xl mt-8 px-4 sm:px-6 lg:px-8">
                <ul
                    role="list"
                    className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
                >
                    {dappUids.map((dappUid) => (
                        <DappLauncherButton key={dappUid} dappUid={dappUid} />
                    ))}
                </ul>
            </div>

            {error && <div>{error}</div>}
        </div>
    )
}
