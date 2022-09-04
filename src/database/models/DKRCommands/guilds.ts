import { model, Schema } from "mongoose";

interface Guild {
    server: string;
    prefix: string;
    language: string;
}

const guild = new Schema<Guild>({
    server: String,
    prefix: String,
    language: String
});

const GuildModel = model("dkrcommands-guilds", guild);

export {
    Guild,
    GuildModel
};
