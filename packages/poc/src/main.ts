import { buildImage } from 'ratu-nixpacks'
import path from 'node:path'
import fs from 'fs/promises'
import { randomUUID } from 'node:crypto'
import clone from 'git-clone/promise'
import { execSync } from 'child_process'
import { parse as parseToml, stringify as serialiseToml } from 'smol-toml'
import { DappConfig, DappConfigSchema } from './DappConfigSchema'

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

    const imageName = await buildImage(`dapp-packer/${config.dapp.uid}`, repoPath)
    console.log(`Built image: ${imageName}`)
    return imageName
}

async function pack(configPath: string, shouldReset?: boolean) {
    const rawNixpacksToml = await fs.readFile(path.resolve(configPath, 'nixpacks.toml'), {
        encoding: 'utf-8',
    })
    const config = DappConfigSchema.parse(parseToml(rawNixpacksToml))

    const existingImages = execSync(`docker images dapp-packer/${config.dapp.uid}`)
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

    const exposePorts = config.dapp.ports || []
    const cmd: string = [
        'docker',
        'run',
        ...exposePorts.map((port) => `-p ${port}`),
        '-it',
        imageName,
    ].join(' ')
    execSync(cmd, {
        stdio: 'inherit',
    })
}

async function main() {
    const dappPath = path.resolve(process.cwd(), process.argv[2])
    const shouldReset = process.argv.some((arg) => arg.trim() === '--reset')
    await pack(dappPath, shouldReset)
}

main()
    .then(() => {
        console.log('Done')
        process.exit(0)
    })
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
