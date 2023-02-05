import mongoose from "mongoose";
mongoose.set("strictQuery", false);
const connectDB = async (DATABASE_URL) => {
    try {
        const DB_OPTIONS = {
            dbName: "csc"
        }
        await mongoose.connect(DATABASE_URL, DB_OPTIONS)
        console.log("Connected succesfully")
    } catch (error) {
        console.log(error)
    }
}

export default connectDB