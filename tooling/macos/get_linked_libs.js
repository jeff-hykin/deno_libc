import { parse as parseMachO } from "./mach_o.js"

var toStr = (arr)=>new TextDecoder().decode(new Uint8Array(arr))
export function getLinkedLibs(fileBytes) {
    const info = parseMachO(fileBytes)
    const reExportedThings = info.cmds.filter(each=>each.type == "reexport_dylib")
    // const otherCmds = info.cmds.filter(each=>each.type != "reexport_dylib")
    // new TextDecoder().decode(new Uint8Array(info.cmds.filter(each=>each.type == "uuid")[0].data))
    // reExportedThings.map(each=>new Uint8Array(each.data))
    const offsetToName = 20 // NOTE: this is from observation, not from documentation. I think this is always the same for "reexport_dylib" segments
    let outputPaths = []
    for (let { data } of reExportedThings) {
        const nameData = new Uint8Array(data).slice(20,)
        const pathString = (new TextDecoder().decode(nameData)).replace(/\x00+$/g,"") // chop off null terminator(s)
    }
    return outputPaths
}