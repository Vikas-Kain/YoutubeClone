import fs from "fs/promises"

const deleteFile = async ( filePath ) => {
    try {
        if ( !filePath ) {
            console.log("No file path given")
            return
        }

        await fs.unlink( filePath )
    }
    catch (error) {
        console.error("error deleting file")
        throw new Error(error.message)
    }
}

export default deleteFile;