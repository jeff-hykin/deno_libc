import { fromCString, MissingSymbolError } from "./ffi.ts"
import { ENAMETOOLONG, ERANGE, UnixError } from "./error_no.ts"

// TODO: most promising: https://github.com/DjDeveloperr/deno_serial/tree/13674f49da27696b7e8cb3ba2dc603c791a2c837/src/darwin

class NotSupportedError extends Error {}

const O_RDWR = 0x2
const O_NOCTTY = 0x100
const O_SYNC = 0x101000
const TCSANOW = 0

const CSIZE = 0o000060
const CS5 = 0o000000
const CS6 = 0o000020
const CS7 = 0o000040
const CS8 = 0o000060
const CSTOPB = 0o000100
const CREAD = 0o000200
const PARENB = 0o000400
const PARODD = 0o001000
const HUPCL = 0o002000
const CLOCAL = 0o004000
const CRTSCTS = 0o20000000000
const VTIME = 5
const VMIN = 6

let libc
if (Deno.build.os === "windows") {
    console.error("lol windows (get rekt)")
} else {
    const commonApi = {
        open: {
            parameters: ["pointer", "i32"],
            result: "i32",
            nonblocking: false,
        },
        close: {
            parameters: ["i32"],
            result: "i32",
            nonblocking: false,
        },
        write: {
            parameters: ["i32", "pointer", "usize"],
            result: "isize",
            nonblocking: false,
        },
        read: {
            parameters: ["i32", "pointer", "usize"],
            result: "isize",
            nonblocking: true,
        },
        strerror: {
            parameters: ["i32"],
            result: "pointer",
            nonblocking: false,
        },
        tcgetattr: {
            parameters: ["i32", "pointer"],
            result: "i32",
            nonblocking: false,
        },
        tcsetattr: {
            parameters: ["i32", "i32", "pointer"],
            result: "i32",
            nonblocking: false,
        },
        cfsetspeed: {
            parameters: ["pointer", "u32"],
            result: "i32",
            nonblocking: false,
        },

        // fopen: {
        //     parameters: ["buffer", "buffer"], 
        //     result: "pointer",
        // }, 
        // malloc: {
        //     parameters: ["usize"], 
        //     result: "pointer",
        // },
        // fread: {
        //     parameters: ["pointer", "usize", "usize", "usize"], 
        //     result: "usize",
        // },
        // fclose: {
        //     parameters: ["pointer"], 
        //     result: "usize",
        // },
		// let file_ptr = libc.symbols.fopen(toCString("input.png"), toCString("rb"));
        
        
        // execve: {
        //     parameters: ["pointer", "pointer", "pointer"],
        //     result: "i32"
        // },
        // errno: {
        //     type: "i32"
        // },
            // try {
            //     libc.symbols.execve(arg0, args, env)
            //     return libc.symbols.errno
            // } finally {
            //     libc.close()
            // }





        getpwuid_r: {
            parameters: ["u32", "pointer", "pointer", "u32", "pointer"],
            result: "i32",
            optional: true,
        },
        getpid: {
            parameters: [],
            result: "i32",
            optional: true,
        },
        getppid: {
            parameters: [],
            result: "i32",
            optional: true,
        },
        getuid: {
            parameters: [],
            result: "u32",
            optional: true,
        },
        geteuid: {
            parameters: [],
            result: "u32",
            optional: true,
        },
        getgid: {
            parameters: [],
            result: "u32",
            optional: true,
        },
        getegid: {
            parameters: [],
            result: "u32",
            optional: true,
        },
        gethostname: {
            parameters: ["buffer", "i32"],
            result: "i32",
            optional: true,
        },
        getgroups: {
            parameters: ["i32", "buffer"],
            result: "i32",
            optional: true,
        },
        getgrgid_r: {
            parameters: ["u32", "pointer", "pointer", "u32", "pointer"],
            result: "i32",
            optional: true,
        },
        strerror_r: {
            parameters: ["i32", "buffer", "i32"],
            result: "i32",
            optional: true,
        },


        // https://github.com/DjDeveloperr/deno_serial/blob/13674f49da27696b7e8cb3ba2dc603c791a2c837/src/darwin/nix.ts
            // open: {
            //     parameters: ["buffer", "i32", "i32"],
            //     result: "i32",
            //     nonblocking: true,
            // },

            ioctl: {
                parameters: ["i32", "i64"],
                result: "i32",
            },

            ioctl1: {
                parameters: ["i32", "i64", "buffer"],
                result: "i32",
                name: "ioctl",
            },

            // tcgetattr: {
            //     parameters: ["i32", "buffer"],
            //     result: "i32",
            // },

            // tcsetattr: {
            //     parameters: ["i32", "i32", "buffer"],
            //     result: "i32",
            // },

            cfmakeraw: {
                parameters: ["buffer"],
                result: "void",
            },

            fcntl: {
                parameters: ["i32", "i32", "i32"],
                result: "i32",
            },

            // strerror: {
            //     parameters: ["i32"],
            //     result: "pointer",
            // },

            aio_read: {
                parameters: ["buffer"],
                result: "i32",
            },

            aio_write: {
                parameters: ["buffer"],
                result: "i32",
            },

            aio_suspend: {
                parameters: ["buffer", "i32", "buffer"],
                result: "i32",
                nonblocking: true,
            },

            aio_cancel: {
                parameters: ["i32", "buffer"],
                result: "i32",
            },

            aio_error: {
                parameters: ["buffer"],
                result: "i32",
            },

            aio_return: {
                parameters: ["buffer"],
                result: "i64",
            },

            cfsetospeed: {
                parameters: ["buffer", "i32"],
                result: "i32",
            },

            cfsetispeed: {
                parameters: ["buffer", "i32"],
                result: "i32",
            },

            tcflush: {
                parameters: ["i32", "i32"],
                result: "i32",
            },

            // close: {
            //     parameters: ["i32"],
            //     result: "i32",
            // },

            // read: {
            //     parameters: ["i32", "buffer", "i32"],
            //     result: "i32",
            //     nonblocking: true,
            // },

            // write: {
            //     parameters: ["i32", "buffer", "i32"],
            //     result: "i32",
            //     nonblocking: true,
            // },
    }
    
    if (Deno.build.os === "linux") {
        libc = Deno.dlopen("/lib/libc.so.6", {
            ...commonApi,
            non_blocking__errno_location: {
                parameters: [],
                result: "pointer",
                nonblocking: true,
                name: "__errno_location",
            },
            __errno_location: {
                parameters: [],
                result: "pointer",
                nonblocking: false,
            },
        }).symbols
    } else if (Deno.build.os === "darwin") {
        libc = await Deno.dlopen("libSystem.dylib", {
            ...commonApi,

        
            // _NSConcreteStackBlock: {
            //     type: "pointer",
            // },
            // _Block_copy: {
            //     parameters: ["pointer"],
            //     result: "pointer",
            // },
            // _Block_release: {
            //     parameters: ["pointer"],
            //     result: "void",
            // },
        }).symbols
    }
}

//
// open
//
if (Deno.build.os === "linux") {
    const getErrString = async function() { {
        var ret = await libc.__errno_location();
        if (ret === null) {
            return ""
        }
        const ptrView = new Deno.UnsafePointerView(ret);
        var ret = await libc.strerror(ptrView.getInt32())
        if (ret === null) {
            return ""
        }
        const ptrView = new Deno.UnsafePointerView(ret)
        const errorString = ptrView.getCString()
        return errorString
    }
    
    // FIXME: 
    // async function open(path) {
    //     const buffer = new TextEncoder().encode(path)
    //     const fd = await clib.open(Deno.UnsafePointer.of(buffer), O_RDWR | O_NOCTTY | O_SYNC)

    //     if (fd < 0) {
    //         throw new Error(`Couldn't open '${path}': ${await getErrString()}`)
    //     }

    //     const tty = new ArrayBuffer(100)
    //     const ttyPtr = Deno.UnsafePointer.of(tty)

    //     if ((await libc.tcgetattr(fd, ttyPtr)) != 0) {
    //         throw new Error(`tcgetattr: ${await getErrString()}`)
    //     }
    // }
}

// adapted from https://raw.githubusercontent.com/gnomejs/sdk/a446797352b055f19448743f102a7636d51796b4/unix/src/libc/deno.ts

/**
 * Get the hostname of the system.
 * @returns {string} The hostname of the system.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the hostname.
 */
export function hostname() {

    if (libc.gethostname === undefined || libc.gethostname === null) {
        throw new MissingSymbolError("gethostname", "libc")
    }

    let ret = ENAMETOOLONG
    let bufLength = 64
    while (ret === ENAMETOOLONG) {
        const buf = new Uint8Array(bufLength)
        ret = libc.gethostname(buf, bufLength)

        if (ret === 0) {
            return fromCString(buf)
        }

        if (ret !== ENAMETOOLONG) {
            throw new UnixError(ret, "Failed to get hostname")
        }

        bufLength *= 2
    }

    throw new UnixError(ret, "Failed to get hostname")
}

/**
 * Get the hostname of the system as a result object.
 * @returns The hostname of the system as a result object.
 */
export function hostnameResult() {
    // : Result<string>

    if (libc.gethostname === undefined || libc.gethostname === null) {
        throw new MissingSymbolError("gethostname", "libc")
    }

    let ret = ENAMETOOLONG
    let bufLength = 64
    while (ret === ENAMETOOLONG) {
        const buf = new Uint8Array(bufLength)
        try {
            ret = libc.gethostname(buf, bufLength)
        } catch (e) {
            throw e
        }

        if (ret === 0) {
            return fromCString(buf)
        }

        if (ret !== ENAMETOOLONG) {
            throw new UnixError(ret, "Failed to get hostname")
        }

        bufLength *= 2
    }

    throw new UnixError(ret, "Failed to get hostname")
}

/**
 * Get the user id of the current process.
 * @returns The user id of the current process.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the user id.
 */
export function uid() {
    // : number

    if (libc.getuid === undefined || libc.getuid === null) {
        throw new MissingSymbolError("getuid", "libc")
    }

    return libc.getuid()
}

/**
 * Get the user id of the current process as a result object.
 * @returns The user id of the current process as a result object.
 */
export function uidResult() {
    // : Result<number>

    if (libc.getuid === undefined || libc.getuid === null) {
        throw new MissingSymbolError("getuid", "libc")
    }

    try {
        return libc.getuid()
    } catch (e) {
        throw e
    }
}

/**
 * Get the effective user id of the current process.
 * @returns The effective user id of the current process.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the effective user id.
 */
export function euid() {
    // : number

    if (libc.geteuid === undefined || libc.geteuid === null) {
        throw new MissingSymbolError("geteuid", "libc")
    }

    return libc.geteuid()
}

/**
 * Get the effective user id of the current process as a result object.
 * @returns The effective user id of the current process as a result object.
 */
export function euidResult() {
    // : Result<number>

    if (libc.geteuid === undefined || libc.geteuid === null) {
        throw new MissingSymbolError("geteuid", "libc")
    }

    try {
        return libc.geteuid()
    } catch (e) {
        throw e
    }
}

/**
 * Get the group id of the current process.
 * @returns The group id of the current process.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the group id.
 */
export function gid() {
    // : number

    if (libc.getgid === undefined || libc.getgid === null) {
        throw new MissingSymbolError("getgid", "libc")
    }

    return libc.getgid()
}

/**
 * Get the group id of the current process as a result object.
 * @returns The group id of the current process as a result object.
 */
export function gidResult() {
    // : Result<number>

    if (libc.getgid === undefined || libc.getgid === null) {
        throw new MissingSymbolError("getgid", "libc")
    }

    try {
        return libc.getgid()
    } catch (e) {
        throw e
    }
}

/**
 * Get the effective group id of the current process.
 * @returns The effective group id of the current process.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the effective group id.
 */
export function egid() {
    // : number

    if (libc.getegid === undefined || libc.getegid === null) {
        throw new MissingSymbolError("getegid", "libc")
    }

    return libc.getegid()
}

/**
 * Get the effective group id of the current process as a result object.
 * @returns The effective group id of the current process as a result object.
 */
export function egidResult() {
    // : Result<number>

    if (libc.getegid === undefined || libc.getegid === null) {
        throw new MissingSymbolError("getegid", "libc")
    }

    try {
        return libc.getegid()
    } catch (e) {
        throw e
    }
}

/**
 * Get the group ids of the current process.
 * @returns The group ids of the current process.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the group ids.
 */
export function groups() {
    // : Uint32Array

    if (libc.getgroups === undefined || libc.getgroups === null) {
        throw new MissingSymbolError("getgroups", "libc")
    }

    const buf = new Uint32Array(1024)
    const ret = libc.getgroups(1024, buf)

    if (ret === -1) {
        throw new UnixError(ret, "Failed to get groups ids")
    }

    return buf.slice(0, ret)
}

/**
 * Get the group ids of the current process as a result object.
 * @returns The group ids of the current process as a result object.
 */
export function groupsResult() {
    // : Result<Uint32Array>

    if (libc.getgroups === undefined || libc.getgroups === null) {
        throw new MissingSymbolError("getgroups", "libc")
    }

    const buf = new Uint32Array(1024)
    let ret = 0
    try {
        ret = libc.getgroups(1024, buf)
    } catch (e) {
        throw e
    }

    if (ret === -1) {
        throw new UnixError(ret, "Failed to get groups ids")
    }

    const groups = buf.slice(0, ret)
    return groups
}

/**
 * Get the process id of the current process.
 * @returns The process id of the current process.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the process id.
 */
export function pid() {
    // : number

    if (libc.getpid === undefined || libc.getpid === null) {
        throw new MissingSymbolError("getpid", "libc")
    }

    return libc.getpid()
}

/**
 * Get the process id of the current process as a result object.
 * @returns The process id of the current process as a result object.
 */
export function pidResult() {
    // : Result<number>

    if (libc.getpid === undefined || libc.getpid === null) {
        throw new MissingSymbolError("getpid", "libc")
    }

    try {
        return libc.getpid()
    } catch (e) {
        throw e
    }
}

/**
 * Get the parent process id of the current process.
 * @returns The parent process id of the current process.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the parent process id.
 */
export function ppid() {
    // : number

    if (libc.getppid === undefined || libc.getppid === null) {
        throw new MissingSymbolError("getppid", "libc")
    }

    return libc.getppid()
}

/**
 * Get the parent process id of the current process as a result object.
 * @returns The parent process id of the current process as a result object.
 */
export function ppidResult() {
    // : Result<number>

    if (libc.getppid === undefined || libc.getppid === null) {
        throw new MissingSymbolError("getppid", "libc")
    }

    try {
        return libc.getppid()
    } catch (e) {
        throw e
    }
}

/**
 * Get the group name for the provided group id.
 * @param gid The group id to get the group name for.
 * @returns The group name for the provided group id.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the group name.
 */
export function groupname(gid) {
    // : string

    if (libc.getgrgid_r === undefined || libc.getgrgid_r === null) {
        throw new MissingSymbolError("getgrgid_r", "libc")
    }

    let ret = ERANGE
    let bufLength = 120
    while (ret === ERANGE) {
        const buf = new Uint8Array(bufLength)
        const grpBuf = new Uint8Array(bufLength)
        const resultBuf = new Uint8Array(bufLength)
        const bufPtr = Deno.UnsafePointer.of(buf)
        const grpBufPtr = Deno.UnsafePointer.of(grpBuf)
        const resultBufPtr = Deno.UnsafePointer.of(resultBuf)

        ret = libc.getgrgid_r(gid, grpBufPtr, bufPtr, bufLength, resultBufPtr)

        if (ret === ERANGE) {
            bufLength *= 2
            continue
        }

        if (ret === 0) {
            return fromCString(buf)
        }

        throw new UnixError(ret, "Failed to get group name")
    }

    throw new UnixError(ret, "Failed to get group name")
}

/**
 * Get the group name for the provided group id as a result object.
 * @param gid The group id to get the group name for.
 * @returns The group name for the provided group id as a result object.
 */
export function groupnameResult(gid) {
    // : Result<string>

    if (libc.getgrgid_r === undefined || libc.getgrgid_r === null) {
        throw new MissingSymbolError("getgrgid_r", "libc")
    }

    let ret = ERANGE
    let bufLength = 120
    while (ret === ERANGE) {
        const buf = new Uint8Array(bufLength)
        const grpBuf = new Uint8Array(bufLength)
        const resultBuf = new Uint8Array(bufLength)
        const bufPtr = Deno.UnsafePointer.of(buf)
        const grpBufPtr = Deno.UnsafePointer.of(grpBuf)
        const resultBufPtr = Deno.UnsafePointer.of(resultBuf)

        try {
            ret = libc.getgrgid_r(gid, grpBufPtr, bufPtr, bufLength, resultBufPtr)
        } catch (e) {
            throw e
        }

        if (ret === ERANGE) {
            bufLength *= 2
            continue
        }

        if (ret === 0) {
            return fromCString(buf)
        }

        throw new UnixError(ret, "Failed to get group name")
    }

    throw new UnixError(ret, "Failed to get group name")
}

/**
 * Get the group entry for the provided group id.
 * @param uid The user id to get the user name for.
 * @returns The user name for the provided user id.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the user name.
 */
export function username(uid) {
    // : string

    if (libc.getpwuid_r === undefined || libc.getpwuid_r === null) {
        throw new MissingSymbolError("getpwuid_r", "libc")
    }

    let ret = ERANGE
    let bufLength = 120

    while (ret === ERANGE) {
        const buf = new Uint8Array(bufLength)
        const pwdBuf = new Uint8Array(bufLength)
        const resultBuf = new Uint8Array(bufLength)
        const bufPtr = Deno.UnsafePointer.of(buf)
        const pwdBufPtr = Deno.UnsafePointer.of(pwdBuf)
        const resultBufPtr = Deno.UnsafePointer.of(resultBuf)

        ret = libc.getpwuid_r(uid, pwdBufPtr, bufPtr, bufLength, resultBufPtr)

        if (ret === ERANGE) {
            bufLength *= 2
            continue
        }

        if (ret === 0) {
            return fromCString(buf)
        }

        throw new UnixError(ret, "Failed to get user name")
    }

    throw new UnixError(ret, "Failed to get user name")
}

/**
 * Get the user name for the provided user id as a result object.
 * @param uid The user id to get the user name for.
 * @returns The user name for the provided user id as a result object.
 */
export function usernameResult(uid) {
    // : Result<string>

    if (libc.getpwuid_r === undefined || libc.getpwuid_r === null) {
        throw new MissingSymbolError("getpwuid_r", "libc")
    }

    let ret = ERANGE
    let bufLength = 120

    while (ret === ERANGE) {
        const buf = new Uint8Array(bufLength)
        const pwdBuf = new Uint8Array(bufLength)
        const resultBuf = new Uint8Array(bufLength)
        const bufPtr = Deno.UnsafePointer.of(buf)
        const pwdBufPtr = Deno.UnsafePointer.of(pwdBuf)
        const resultBufPtr = Deno.UnsafePointer.of(resultBuf)

        try {
            ret = libc.getpwuid_r(uid, pwdBufPtr, bufPtr, bufLength, resultBufPtr)
        } catch (e) {
            throw e
        }

        if (ret === ERANGE) {
            bufLength *= 2
            continue
        }

        if (ret === 0) {
            return fromCString(buf)
        }

        throw new UnixError(ret, "Failed to get user name")
    }

    throw new UnixError(ret, "Failed to get user name")
}

/**
 * Get the group entry for the provided group id.
 * @param uid The user id to get the password entry for.
 * @returns The password entry for the provided user id.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the password entry.
 */
export function passwdEntry(uid) {
    // : PwEnt

    if (libc.getpwuid_r === undefined || libc.getpwuid_r === null) {
        throw new MissingSymbolError("getpwuid_r", "libc")
    }

    let ret = ERANGE
    let bufLength = 512
    while (ret === ERANGE) {
        const buf = new Uint8Array(bufLength)
        const pwdBuf = new Uint8Array(bufLength)
        const resultBuf = new Uint8Array(bufLength)
        const bufPtr = Deno.UnsafePointer.of(buf)
        const pwdBufPtr = Deno.UnsafePointer.of(pwdBuf)
        const resultBufPtr = Deno.UnsafePointer.of(resultBuf)

        ret = libc.getpwuid_r(uid, pwdBufPtr, bufPtr, bufLength, resultBufPtr)

        if (ret === ERANGE) {
            bufLength *= 2
            continue
        }

        if (ret === 0) {
            const v = new Deno.UnsafePointerView(pwdBufPtr)
            const nameId = v.getBigInt64(0)
            const namePtr = Deno.UnsafePointer.create(nameId)
            const name = Deno.UnsafePointerView.getCString(namePtr)
            const pwId = v.getBigInt64(8)
            const pwPtr = Deno.UnsafePointer.create(pwId)
            const pw = Deno.UnsafePointerView.getCString(pwPtr)
            const uid = v.getInt32(16)
            const gid = v.getInt32(20)
            const gecosId = v.getBigInt64(24)
            const gecosPtr = Deno.UnsafePointer.create(gecosId)
            const gecos = gecosPtr === null ? "" : Deno.UnsafePointerView.getCString(gecosPtr)
            const dirId = v.getBigInt64(32)
            const dirPtr = Deno.UnsafePointer.create(dirId)
            const dir = Deno.UnsafePointerView.getCString(dirPtr)
            const shellId = v.getBigInt64(40)
            const shellPtr = Deno.UnsafePointer.create(shellId)
            const shell = Deno.UnsafePointerView.getCString(shellPtr)

            const result = {
                name: name,
                passwd: pw,
                uid: uid,
                gid: gid,
                gecos: gecos,
                dir: dir,
                shell: shell,
            }

            return result
        }

        throw new UnixError(ret, "Failed to get password entry")
    }

    throw new UnixError(ret, "Failed to get password entry")
}

/**
 * Get the password entry for the provided user id as a result object.
 * @param uid The user id to get the password entry for.
 * @returns The password entry for the provided user id as a result object.
 */
export function passwdEntryResult(uid) {
    // : Result<PwEnt>

    if (libc.getpwuid_r === undefined || libc.getpwuid_r === null) {
        throw new MissingSymbolError("getpwuid_r", "libc")
    }

    let ret = ERANGE
    let bufLength = 512
    while (ret === ERANGE) {
        const buf = new Uint8Array(bufLength)
        const pwdBuf = new Uint8Array(bufLength)
        const resultBuf = new Uint8Array(bufLength)
        const bufPtr = Deno.UnsafePointer.of(buf)
        const pwdBufPtr = Deno.UnsafePointer.of(pwdBuf)
        const resultBufPtr = Deno.UnsafePointer.of(resultBuf)

        try {
            ret = libc.getpwuid_r(uid, pwdBufPtr, bufPtr, bufLength, resultBufPtr)
        } catch (e) {
            throw e
        }

        if (ret === ERANGE) {
            bufLength *= 2
            continue
        }

        if (ret === 0) {
            const v = new Deno.UnsafePointerView(pwdBufPtr)
            const nameId = v.getBigInt64(0)
            const namePtr = Deno.UnsafePointer.create(nameId)
            const name = Deno.UnsafePointerView.getCString(namePtr)
            const pwId = v.getBigInt64(8)
            const pwPtr = Deno.UnsafePointer.create(pwId)
            const pw = Deno.UnsafePointerView.getCString(pwPtr)
            const uid = v.getInt32(16)
            const gid = v.getInt32(20)
            const gecosId = v.getBigInt64(24)
            const gecosPtr = Deno.UnsafePointer.create(gecosId)
            const gecos = gecosPtr === null ? "" : Deno.UnsafePointerView.getCString(gecosPtr)
            const dirId = v.getBigInt64(32)
            const dirPtr = Deno.UnsafePointer.create(dirId)
            const dir = Deno.UnsafePointerView.getCString(dirPtr)
            const shellId = v.getBigInt64(40)
            const shellPtr = Deno.UnsafePointer.create(shellId)
            const shell = Deno.UnsafePointerView.getCString(shellPtr)

            const result = {
                name: name,
                passwd: pw,
                uid: uid,
                gid: gid,
                gecos: gecos,
                dir: dir,
                shell: shell,
            }

            return result
        }

        throw new UnixError(ret, "Failed to get password entry")
    }

    throw new UnixError(ret, "Failed to get password entry")
}

/**
 * Get the group entry for the provided group id.
 * @param gid The group id to get the group entry for.
 * @returns The group entry for the provided group id.
 * @throws {NotSupportedError} Thrown if the method is not supported on the current platform.
 * @throws {MissingSymbolError} Thrown if the required symbol is not available in the libc library.
 * @throws {UnixError} Thrown if an error occurs while getting the group entry.
 */
export function groupEntry(gid) {
    // : GrEnt

    if (libc.getgrgid_r === undefined || libc.getgrgid_r === null) {
        throw new MissingSymbolError("getgrgid_r", "libc")
    }

    let ret = ERANGE
    let bufLength = 120
    while (ret === ERANGE) {
        const buf = new Uint8Array(bufLength)
        const grpBuf = new Uint8Array(bufLength)
        const resultBuf = new Uint8Array(bufLength)
        const bufPtr = Deno.UnsafePointer.of(buf)
        const grpBufPtr = Deno.UnsafePointer.of(grpBuf)
        const resultBufPtr = Deno.UnsafePointer.of(resultBuf)

        ret = libc.getgrgid_r(gid, grpBufPtr, bufPtr, bufLength, resultBufPtr)

        if (ret === ERANGE) {
            bufLength *= 2
            continue
        }

        if (ret === 0) {
            const v = new Deno.UnsafePointerView(grpBufPtr)
            const nameId = v.getBigInt64(0)
            const namePtr = Deno.UnsafePointer.create(nameId)
            const name = Deno.UnsafePointerView.getCString(namePtr)

            const pwId = v.getBigInt64(8)
            const pwPtr = Deno.UnsafePointer.create(pwId)
            const pw = Deno.UnsafePointerView.getCString(pwPtr)

            const gid = v.getUint32(16)

            const membersPtr = v.getPointer(24)
            const set = new Array()
            if (membersPtr !== null) {
                const members = new Deno.UnsafePointerView(membersPtr)
                let intptr = 0

                let ptr = members.getPointer(intptr)
                while (ptr != null) {
                    set.push(Deno.UnsafePointerView.getCString(ptr))
                    intptr += 8
                    ptr = members.getPointer(intptr)
                }
            }

            const result = {
                name: name,
                passwd: pw,
                gid: gid,
                members: set,
            }

            return result
        }

        throw new UnixError(ret, "Failed to get group entry")
    }

    throw new UnixError(ret, "Failed to get group entry")
}

/**
 * Get the group entry for the provided group id as a result object.
 * @param gidNumber The group id to get the group entry for.
 * @returns {GrEnt} The group entry for the provided group id as a result object.
 */
export function groupEntryResult(gidNumber) {

    if (libc.getgrgid_r === undefined || libc.getgrgid_r === null) {
        throw new MissingSymbolError("getgrgid_r", "libc")
    }

    let ret = ERANGE
    let bufLength = 120
    while (ret === ERANGE) {
        const buf = new Uint8Array(bufLength)
        const grpBuf = new Uint8Array(bufLength)
        const resultBuf = new Uint8Array(bufLength)
        const bufPtr = Deno.UnsafePointer.of(buf)
        const grpBufPtr = Deno.UnsafePointer.of(grpBuf)
        const resultBufPtr = Deno.UnsafePointer.of(resultBuf)

        try {
            ret = libc.getgrgid_r(gidNumber, grpBufPtr, bufPtr, bufLength, resultBufPtr)
        } catch (e) {
            throw e
        }

        if (ret === ERANGE) {
            bufLength *= 2
            continue
        }

        if (ret === 0) {
            const v = new Deno.UnsafePointerView(grpBufPtr)
            const nameId = v.getBigInt64(0)
            const namePtr = Deno.UnsafePointer.create(nameId)
            const name = Deno.UnsafePointerView.getCString(namePtr)

            const pwId = v.getBigInt64(8)
            const pwPtr = Deno.UnsafePointer.create(pwId)
            const pw = Deno.UnsafePointerView.getCString(pwPtr)

            const gid = v.getUint32(16)

            const membersPtr = v.getPointer(24)
            const set = new Array()
            if (membersPtr !== null) {
                const members = new Deno.UnsafePointerView(membersPtr)
                let intptr = 0

                let ptr = members.getPointer(intptr)
                while (ptr != null) {
                    set.push(Deno.UnsafePointerView.getCString(ptr))
                    intptr += 8
                    ptr = members.getPointer(intptr)
                }
            }

            const result = {
                name: name,
                passwd: pw,
                gid: gid,
                members: set,
            }

            return result
        }

        throw new UnixError(ret, "Failed to get group entry")
    }

    throw new UnixError(ret, "Failed to get group entry")
}