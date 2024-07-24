import mongoose, { Document, Schema, model } from "mongoose";
import { RoleModel } from "./role-model"

export interface IUserModel extends Document {
    codeBlockId: mongoose.Schema.Types.ObjectId,
    nickname: string,
    role: RoleModel
}

export const UserSchema = new Schema<IUserModel>({
    codeBlockId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Missing Block Code Id."],
    },
    nickname: {
        type: String,
        required: [true, "Missing nickname."],
    },
    role: {
        type: String,
        enum: Object.values(RoleModel),
    }

}, { versionKey: false });

export const UserModel = model<IUserModel>("UserModel", UserSchema, "users");