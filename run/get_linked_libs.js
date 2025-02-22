import $ from "https://esm.sh/jsr/@david/dax@0.42.0/mod.ts"
import { getLinkedLibs as getLinkedLibsDarwin } from "../tooling/macos/linked_libs.js"

// const $$ = (...args)=>$(...args).noThrow()
// await $$`false`
// await $$`false`.text("stderr")

const file = Deno.args[0]
const bytes = Deno.readFileSync(file)
if (Deno.build.os == "darwin") {
    console.log(JSON.stringify(getLinkedLibsDarwin(bytes)))
} else if (Deno.build.os == "linux") {
    // console.log(JSON.stringify(getLinkedLibsDarwin(bytes)))
}