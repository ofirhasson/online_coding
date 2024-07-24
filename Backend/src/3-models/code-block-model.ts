import mongoose, { Document, Schema, model } from "mongoose";

export interface ICodeBlockModel extends Document {
    initialCode: string,
    writtenCode: string,
    title: string,
    members: mongoose.Schema.Types.ObjectId[],
    solution: string
}

export const CodeBlockSchema = new Schema<ICodeBlockModel>({
    initialCode: {
        type: String,
        required: [true, "Missing Initial Code."],
    },
    writtenCode: {
        type: String
    },
    title: {
        type: String,
        required: [true, "Missing Title."]
    },
    solution: {
        type: String,
        required: [true, "Missing Solution."]
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "UserModel"
    }

}, { versionKey: false });

export const CodeBlockModel = model<ICodeBlockModel>("CodeBlockModel", CodeBlockSchema, "code-blocks");