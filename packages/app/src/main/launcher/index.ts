import { buildImage } from 'ratu-nixpacks'
import path from 'node:path'
import fs from 'fs/promises'
import { randomUUID } from 'node:crypto'
import clone from 'git-clone/promise'
import { execSync } from 'child_process'
import { parse as parseToml, stringify as serialiseToml } from 'smol-toml'
import { DappConfigSchema, type DappConfig } from '../../common/types/DappConfigSchema'
import * as os from 'node:os'

function getImageName(dappUid: string) {
    return `dapp-packer/${dappUid}`
}

function getContainerName(dappUid: string) {
    return `dapp-packer-container__${dappUid}`
}

async function buildDockerImage(config: DappConfig): Promise<string> {
    const zipId = randomUUID()
    const repoPath = path.resolve(`/tmp/${zipId}/${config.dapp.uid}`)
    // TODO: Add option for checking out a specific revision/tag/branch
    await clone(config.dapp.repository, repoPath, {
        checkout: config.dapp.tag,
    })
    console.log(`Extracted repo to: ${repoPath}`)

    if (config) {
        await fs.writeFile(path.resolve(repoPath, 'nixpacks.toml'), serialiseToml(config), {
            encoding: 'utf-8',
        })
    }

    const imageName = await buildImage(getImageName(config.dapp.uid), repoPath)
    console.log(`Built image: ${imageName}`)
    return imageName
}

export async function isDappContainerRunning(dappUid: string) {
    const containers = execSync(`docker ps --filter name=${getContainerName(dappUid)}`)
        .toString('utf-8')
        .trim()
        .split('\n')
        .slice(1)
    if (containers.length > 0) {
        return true
    } else {
        return false
    }
}

/**
 * Build docker image (if required) then launch the container serving the dapp
 *
 * @param configPath Config path that contains a `nixpacks.toml` definition
 * @param shouldReset If true, force rebuild the docker image
 */
export async function buildAndRun(config: DappConfig, shouldReset?: boolean): Promise<string> {
    const dappUrl = `http://localhost:${config.dapp.httpPort}`

    // 1. Check if container is running already
    const isRunning = await isDappContainerRunning(config.dapp.uid)
    if (isRunning) {
        console.log(`Container for ${config.dapp.uid} is already running`)
        return dappUrl
    }

    // 2. Check if image exists, otherwise build it
    const existingImages = execSync(`docker images ${getImageName(config.dapp.uid)}`)
        .toString('utf-8')
        .trim()
        .split('\n')
        .map((line) => line.split(/\s+/)[0])
        .slice(1)
    let imageName: string
    if (existingImages.length > 0 && !shouldReset) {
        console.log(`Found existing images for ${config.dapp.uid}:`, existingImages)
        imageName = existingImages[0]
    } else {
        imageName = await buildDockerImage(config)
    }

    // 3. Run the container
    console.log(`Running container for ${imageName}...`)
    const exposePorts = config.dapp.ports || []
    const cmd: string = [
        'docker',
        'run',
        '-d',
        ...exposePorts.map((port) => `-p ${port}`),
        '--name',
        getContainerName(config.dapp.uid),
        imageName,
    ].join(' ')
    const dockerRunResult = execSync(cmd, { stdio: 'inherit' }).toString('utf-8')
    console.log('Result:', dockerRunResult)

    return dappUrl
}

export async function launch(dappUid: string, shouldReset?: boolean): Promise<string> {
    // Ensure dappdefs git repo is cloned and up to date
    const baseAppPath = path.resolve(os.homedir(), '.ratu')
    const dappDefsPath = path.resolve(baseAppPath, 'dappdefs')
    const dappDefsPathExists = await fs
        .stat(dappDefsPath)
        .then(() => true)
        .catch(() => false)
    if (!dappDefsPathExists) {
        console.log('Cloning dappdefs...')
        // Create app dir
        await fs.mkdir(baseAppPath)
        // Clone dappdefs repo
        await clone('https://github.com/kevincharm/dappdefs.git', dappDefsPath)
    } else {
        // Just make sure we're up-to-date
        console.log('Pulling latest changes from dappdefs...')
        await execSync('git pull origin master', {
            cwd: dappDefsPath,
        })
    }

    const configPath = path.resolve(dappDefsPath, `${dappUid}/nixpacks.toml`)
    const config = DappConfigSchema.parse(
        parseToml(
            await fs.readFile(configPath, {
                encoding: 'utf-8',
            }),
        ),
    )
    return buildAndRun(config, shouldReset)
}
