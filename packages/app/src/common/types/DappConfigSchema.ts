import z from 'zod'
import { NixpacksTomlSchema } from './NixpacksSchema'

export const DappConfigSchema = NixpacksTomlSchema.extend({
    dapp: z.object({
        uid: z.string(),
        repository: z.string(),
        tag: z.string().optional(),
        /** Where the app will be served */
        httpPort: z.number(),
        /** Ports to expose when running the docker container */
        ports: z
            .array(
                z
                    .string()
                    .refine((arg: any): arg is `${number}:${number}` =>
                        /^[0-9]+:[0-9]+$/.test(arg),
                    ),
            )
            .optional(),
    }),
})

export type DappConfig = z.infer<typeof DappConfigSchema>
