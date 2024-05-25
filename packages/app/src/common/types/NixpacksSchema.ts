import z from 'zod'

export const NixpacksTomlSchema = z.object({
    providers: z.array(z.string()).optional(),
    phases: z
        .object({
            setup: z
                .object({
                    nixPkgs: z.array(z.string()).optional(),
                    aptPkgs: z.array(z.string()).optional(),
                })
                .optional(),
            install: z
                .object({
                    cmds: z.array(z.string()).optional(),
                })
                .optional(),
            build: z
                .object({
                    cmds: z.array(z.string()).optional(),
                })
                .optional(),
        })
        .optional(),
    start: z
        .object({
            cmd: z.string().optional(),
        })
        .optional(),
})

export type NixpacksToml = z.infer<typeof NixpacksTomlSchema>
