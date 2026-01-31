
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Start fetching spaces...')
    const start = Date.now()

    try {
        const spaces = await prisma.space.findMany({
            include: {
                folders: {
                    include: {
                        lists: {
                            include: {
                                statuses: true
                            }
                        },
                    },
                },
                lists: {
                    include: {
                        statuses: true
                    }
                },
                statuses: true
            },
        });

        console.log(`Fetched ${spaces.length} spaces in ${Date.now() - start}ms`)
        console.log('Success!')
    } catch (e) {
        console.error('Error fetching spaces:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
