var removalConfig = JSON.parse(JsonIO.readJson('config/reliable_remover/removals.json').toString())

var REMOVED_BLOCKS = []

removalConfig.forEach(entry => {
    if (entry.action !== 'remove' || !entry.blocks) return

    var blocks = Array.isArray(entry.blocks) ? entry.blocks : [entry.blocks]

    blocks.forEach(block => {
        if (!REMOVED_BLOCKS.includes(block)) {
            REMOVED_BLOCKS.push(block)
        }
    })
})

ServerEvents.command(event => {
    var parseResults = event.getParseResults()
    var command = parseResults.getReader().getString()
    var source = parseResults.getContext().getSource()

    var isPlacementCommand = /\b(?:minecraft:)?(?:setblock|fill)\b/.test(command)
    if (!isPlacementCommand) return

    for (var block of REMOVED_BLOCKS) {
        if (command.includes(block)) {
            source.sendFailure(Text.red(`'${block}' is disabled.`))
            event.cancel()
            return
        }
    }
})

BlockEvents.placed(event => {
    var block = event.block.id
    if (!REMOVED_BLOCKS.includes(block)) return

    if (event.player) {
        event.player.tell(Text.red(`'${block}' is disabled.`))
    }

    event.cancel()
})
