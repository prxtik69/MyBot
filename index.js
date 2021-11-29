const Discord = require('discord.js')
const config = require('./Data/config.json')
const intents = new Discord.Intents([
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_BANS",
    "GUILD_EMOJIS_AND_STICKERS",
    "GUILD_INTEGRATIONS",
    "GUILD_WEBHOOKS",
    "GUILD_INVITES",
    "GUILD_VOICE_STATES",
    "GUILD_PRESENCES",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_MESSAGE_TYPING",
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_TYPING"
])

const bot = new Discord.Client({intents})



bot.on('ready' , () => {
    console.log(`${bot.user.tag} logged in`)
    bot.user.setActivity(`${config.activity}` , {
        type:`${config.statusType}`,
        url:"https://www.twitch.tv/discord"
    })
    
})


bot.on('messageCreate' , message =>{
    const user = message.guild.members.cache.get(bot.user.id)
    if(!user.permissions.has("ADMINISTRATOR")){
        message.guild.leave()
        return
    }
    if (message){

    }
    if(message.mentions.has(bot.user.id)){
        const PingedEmbed = {
            color : "BLUE",
            description : `**Hello ${message.author} my prefix is \`${config.prefix}\`. Please type \`${config.prefix}help\` to get started!**`
        }
        message.channel.send({embeds : [PingedEmbed]})
    }
    if (!message.content.startsWith(config.prefix)) return
    if (!config.welcome_channel_id && !config.modRoleID && !config.SuccessEmoji && !config.crossEmoji && !config.logsChannelID){
        message.channel.send('Please set all the required variables in the config.json file')
        return
    }
    const args = message.content.slice(config.prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()

// <---------------------------- PING COMMAND ----------------------------------->

    if (command === 'ping'){
        const PingEmbed = new Discord.MessageEmbed()
        .setColor('GREEN')
        
        .setDescription(`**${config.SuccessEmoji} Latency is \`${Date.now() - message.createdTimestamp}\`ms. API Latency is \`${Math.round(bot.ws.ping)}\`ms**`)
        message.channel.send({embeds : [PingEmbed]}).catch(err => console.log(err))
    }
     
// <---------------------------- PURGE COMMAND ----------------------------------->

    if (command === 'purge' || command === 'delete' && message.member.permissions.has('MANAGE_MESSAGES')){
        const amount = args[0]
        if(message){
            message.delete()
        }
        const PurgeAmountNotANumber ={
            color :"RED",
            description :`${config.crossEmoji} **Please enter the value between \`1\` to \`100\` to delete messages**`
        }
        if(isNaN(amount) || amount < 0 || amount > 100){
            message.channel.send({embeds:[PurgeAmountNotANumber]}).catch(err => console.log(err))
            return
        }
        
        const NoTargetForPurge = new Discord.MessageEmbed()
        .setColor("RED")
        .setDescription(`${config.crossEmoji} ** Please Provide Number of Messages you want to purge / delete.\n\n__Usage__ : \n\n\`${config.prefix}purge <amount of messages>\`\n\`${config.prefix}purge 69\`\n\`${config.prefix}delete 69\`**`)
        .setFooter(`Note : Bot will ignore the command if you type anything except number of messages.`)
        if(!args[0]){
            message.channel.send({embeds: [NoTargetForPurge]}).catch(err => console.log(err))
        }
        // if (!isNaN(args[0])) return message.channel.send(`${config.crossEmoji} **Please enter a valid number**`)

        else{
            message.channel.bulkDelete(amount , true).catch(err => console.log(err))
        const PurgeEmbed = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setDescription(`${config.SuccessEmoji} **Deleted \`${amount}\` message(s)**`)
        message.channel.send({embeds : [PurgeEmbed]}).catch(err => console.log(err))
        }
        
        
    }



// <---------------------------- MEMBERCOUNT COMMAND ----------------------------------->

if (command === "membercount" || command === "mc" && message.member.permissions.has("ADMINISTRATOR")){
    let GuildID = message.guild.id
    // let memberCount = bot.guilds.cache.get(GuildID).members.cache.filter(member => !member.user.bot).size;
    let BotsInServer = bot.guilds.cache.get(GuildID).members.cache.filter(member => member.user.bot).size;

        const MemberCountEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Total Members in Server : \`${message.guild.memberCount}\`\nCurrent Bots in Server : \`${BotsInServer}\`**`)
        message.channel.send({embeds: [MemberCountEmbed]}).catch(err => console.log(err))
    }



// <---------------------------- KICK COMMAND ----------------------------------->


    if(command === "kick"){
        let Mod = message.member.roles.cache.has(config.modRoleID) ||  message.member.permissions.has("KICK_MEMBERS")
        let reason = args.slice(1).join(" ");

        const NotModEmbed = new Discord.MessageEmbed()
        .setColor("RED")
        .setDescription(`${config.crossEmoji} **You do not have Moderator Role / Permission to Kick Members**`)
        if (!Mod){
            message.channel.send({embeds : [NotModEmbed]}).catch(err => console.log(err))
        }
        if (Mod){
            let Target = message.mentions.members.first() || args[0]
            if (!Target){
                const Nottarget = new Discord.MessageEmbed()
                .setColor("RED")
                .setDescription(`${config.crossEmoji}**Please Mention someone to Kick\n\n__Usage__ : \n\n\`${config.prefix}kick @user\`\n\`${config.prefix}kick @Pratikk@6969\`**`)

                message.channel.send({embeds : [Nottarget]}).catch(err => console.log(err))
            }
            else{
                if (!reason){
                    reason = "No Reason Provided"
                }
                Target.kick(reason).catch(err => console.log(err))
                const KickedEmbed = new Discord.MessageEmbed()
                .setColor("GREEN")
                .setDescription(`${config.SuccessEmoji} **${Target} has been kicked.**\n\n**By : \`${message.author.username}\`\nReason : \`${reason}\`**`)
                message.channel.send({embeds:[KickedEmbed]}).catch(err => console.log(err))

                const KickedDMEmbed = new Discord.MessageEmbed()
                .setColor("RED")
                .setDescription(`**You have been kicked from __${message.guild}__.**\n\n**By : \`${message.author.username}\`\nReason : \`${reason}\`**`)
                Target.send({embeds:[KickedDMEmbed]}).catch(err => console.log(err))
                
            }
        }
    }


// <---------------------------- BAN COMMAND ----------------------------------->

    if (command === "ban"){
        const NoBanPermsEmbed = {
            color:"RED",
            description:`${config.crossEmoji} ** You do not have permissions to ban a user.**`
        }
        const NoTargetEmbed = {
            color:"RED",
            description:`${config.crossEmoji}** Please Mention someone you want BAN\n\n__Usage__ : \n\n\`${config.prefix}ban @user <reason>\`\n\`${config.prefix}ban @Pratikk#6969 For Being Cute\`**`
        }
        

        if (!message.member.permissions.has("BAN_MEMBERS")){
            message.channel.send({embeds : [NoBanPermsEmbed]})
            return;
        }
        if(!message.member.roles.cache.has(config.modRoleID)){
            message.channel.send({embeds : [NoBanPermsEmbed]})
            return;
        }
        let Target = message.mentions.members.first()
        let reason = args.slice(1).join(" ");
        
        if(!Target){
            message.channel.send({embeds : [NoTargetEmbed]})
            return;
        }

        

        else if (Target && message.member.roles.cache.has(config.modRoleID) && message.member.permissions.has("BAN_MEMBERS") && Target.bannable){
            if(!reason){
                reason = "No Reason Provided"
            }
            const BannedEmbed = {
                color:"GREEN",
                description:`${config.SuccessEmoji} **Banned ${Target}\n\nBy : \`${message.author.username}\`\nFor : \`${reason}\`**`
            }
            const BannedDMEmbed = {
                color:"RED",
                description:`**You have been Banned from ${message.guild}\n\nBy : \`${message.author.username}\`\nFor : \`${reason}\`**`
            }

            Target.ban({ days: 7, reason: 'They deserved it' })
  .then(console.log)
  .catch(console.error);
            
            message.channel.send({embeds : [BannedEmbed]}).then(Target.send({embeds : [BannedDMEmbed]}))

        if(config.logsChannelID){
            const UserBannedEmbed = {
                color:"BLUE",
                description:`**User Banned : ${Target}\nBanned By : ${message.author.tag}**`
            }
            let LogChannel = message.guild.channels.cache.get(config.logsChannelID)
            LogChannel.send({embeds : [UserBannedEmbed]}).catch(err => console.log(err))
        }
            

        }

    }


   

// <---------------------------- PULL COMMAND ----------------------------------->


    if (command === "pull" && message.member.permissions.has("MOVE_MEMBERS")){
        if(!message.member.permissions.has('MOVE_MEMBERS')) return;

        const member = message.mentions.members.first();
        if(!member){
            const NoTargetToPull = {
                color:"RED",
                description:`${config.crossEmoji} **Please mention a member that you want to pull in your vc!**`
            }
            message.channel.send({embeds : [NoTargetToPull]});
            return;
        }
        const ModNotInVC = {
            color:"RED",
            description: `**${config.crossEmoji} ${message.author} , you need join a voice channel before you can actually pull an user**`
            
        }
        if(!message.member.voice.channel){
            message.channel.send({embeds : [ModNotInVC]});
            return
        }

        if(!member.voice.channel){
            const TargetNotInVC ={
                color : "RED",
                description:`**${config.crossEmoji} ${member} is not in any Voice Channel to Pull them.**`
            }
            message.channel.send({embeds:[TargetNotInVC]}).catch(err => console.log(err)) 
            return
        }
        
        
        if(message.member.voice.channel === member.voice.channel) {
            const UserAlreadyInYourVC = {
                color :"RED",
                description:`** ${config.crossEmoji} ${member} is already present in your Voice Channel.**`
            }
            message.channel.send({embeds:[UserAlreadyInYourVC]})
            return
        }
        member.voice.setChannel(message.member.voice.channel).catch(err => console.log(err)) 
            const MovedEmbed = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setDescription(`${config.SuccessEmoji} **Pulled ${member} to your Voice Channel.**`)

            message.channel.send({embeds:[MovedEmbed]})


        }



// <---------------------------- DISCONNECT COMMAND ----------------------------------->


    if (command === "disconnect" || command === "dc"){
        
        if (!message.member.permissions.has("MOVE_MEMBERS") || !message.member.roles.cache.has(config.modRoleID)){
            return
        }
        
        const Target = message.mentions.members.first();
        // const TargetID = message.guild.members.cache.get(Target.id);
        // const Targett = message.guild.mem

        if(!Target){
            message.channel.send("ok")
            return;
        }

        if(!Target.voice.channel) {
            // const UserNotInVCtoDisconnect = {
            //     color:"BLUE",
            //     description:`**${config.crossEmoji} ${message.author} , they need be in a voice channel before you can actually disconnect an user**`
            // }
            const UserNotInVCtoDisconnect = new Discord.MessageEmbed()
            .setColor("RED")
            .setDescription(`**${config.crossEmoji} ${message.author} , they need be in a voice channel before you can actually disconnect an user**`)
            message.channel.send({embeds:[UserNotInVCtoDisconnect]})
            return;
    }
        Target.voice.disconnect().catch(err => console.log(err))
        const DisconnectedEmbed = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setDescription(`${config.SuccessEmoji} **Disconnected ${Target} from Voice Channel ${Target.voice.channel}**`)
        message.channel.send({embeds:[DisconnectedEmbed]}).catch(err => console.log(err))
        const DisconnectedLog = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**${Target} has been disconnected from Voice Channel ${Target.voice.channel}**`)

        message.guild.channels.cache.get(config.logsChannelID).send({embeds:[DisconnectedLog]})
    }
    
    if(command === "restrict"){
        let Target = message.mentions.members.first();
        if(!message.member.permissions.has("MANAGE_CHANNEL") || !message.member.roles.cache.has(config.modRoleID)){
            const NoPerms = {
                color:"RED",
                description:`${config.crossEmoji} **You don't have the permissions to use this command.**`
            };
            message.channel.send({embeds:[NoPerms]})
            return;
        }

        if (!Target){
            const NoTarget = {
                color:"RED",
                description:`${config.crossEmoji} **Please mention a member that you want to restrict!**`
            }
            message.channel.send({embeds:[NoTarget]}).catch(err => console.log(err))
            return;
        }

        if(message.member.permissions.has("MANAGE_CHANNEL") && message.member.roles.cache.has(config.modRoleID)){
            const RestrictedEmbed = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setDescription(`${config.SuccessEmoji} **${Target} has been restricted from sending messages in this channel.**`)

            let channel = message.guild.channels.cache.find(channel => channel.id === message.channel.id)
            channel.permissionOverwrites.create(Target, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false
            }).catch(err => console.log(err))

            message.channel.send({embeds:[RestrictedEmbed]}).catch(err => console.log(err))
            return;
    }
}

if(command === "unrestrict"){
    let Target = message.mentions.members.first();
    if(!message.member.permissions.has("MANAGE_CHANNEL") || !message.member.roles.cache.has(config.modRoleID)){
        const NoPerms = {
            color:"RED",
            description:`${config.crossEmoji} **You don't have the permissions to use this command.**`
        };
        message.channel.send({embeds:[NoPerms]})
        return;
    }

    if (!Target){
        const NoTarget = {
            color:"RED",
            description:`${config.crossEmoji} **Please mention a member that you want to unrestrict!**`
        }
        message.channel.send({embeds:[NoTarget]}).catch(err => console.log(err))
        return;
    }

    if(message.member.permissions.has("MANAGE_CHANNEL") && message.member.roles.cache.has(config.modRoleID)){
        const RestrictedEmbed = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setDescription(`${config.SuccessEmoji} **${Target} can now send messages in this channel.**`)

        let channel = message.guild.channels.cache.find(channel => channel.id === message.channel.id)
        channel.permissionOverwrites.delete(Target).catch(err => console.log(err))

        message.channel.send({embeds:[RestrictedEmbed]}).catch(err => console.log(err))
        return;
}
}

    if(command === "slow" || command === "slowmode" || command === "sm"){
        let time = args[0];
        // console.log(time)
        if(!message.member.permissions.has("MANAGE_CHANNEL") || !message.member.roles.cache.has(config.modRoleID)){
            const NoPerms = {
                color:"RED",
                description:`${config.crossEmoji} **You don't have the permissions to use this command.**`
            };
            message.channel.send({embeds:[NoPerms]})
            return;
        }

        if (!time){
            const NoTime = {
                color:"RED",
                description:`${config.crossEmoji} **Please specify a time in seconds!**`
            }
            message.channel.send({embeds:[NoTime]}).catch(err => console.log(err))
            return;
        }

        if (time === "off" || time === "OFF"){
            const Off = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setDescription(`${config.SuccessEmoji} **Slowmode has been turned off.**`)
            message.channel.send({embeds:[Off]}).catch(err => console.log(err))
            message.channel.setRateLimitPerUser(0)
            return;
        }
        
        if(isNaN(time) || time.endsWith("s")){
            const NotANumber = new Discord.MessageEmbed()
                .setColor("RED")
                .setDescription(`${config.crossEmoji} **Please specify a number in seconds!**`)
                .setFooter("Note : Do not add 's' in the seconds , and always specify time in seconds.")
            
            message.channel.send({embeds:[NotANumber]}).catch(err => console.log(err))
            return;
        }

        

        if(message.member.permissions.has("MANAGE_CHANNEL") && message.member.roles.cache.has(config.modRoleID)){
            const SlowModeEmbed = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setDescription(`${config.SuccessEmoji} **Slowmode has been set to ${time} seconds.**`)

            message.channel.setRateLimitPerUser(time).catch(err => console.log(err))
            message.channel.send({embeds:[SlowModeEmbed]}).catch(err => console.log(err))
            return;
        }
    }


})

// <---------------------- LOGS -------------------------->


    bot.on("channelCreate" , channel => {
        if (!channel.guild) return;
        const ChannelCreatedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Channel Created : ${channel}**`)
        channel.guild.channels.cache.get(config.logsChannelID).send({embeds:[ChannelCreatedEmbed]}).catch(err => console.log(err))
    })

    bot.on("channelDelete" , channel => {
        if (!channel.guild) return;
        const ChannelDeletedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Channel Deleted : #${channel.name}**`)
        channel.guild.channels.cache.get(config.logsChannelID).send({embeds:[ChannelDeletedEmbed]}).catch(err => console.log(err))
    })

    bot.on("channelUpdate" , (oldChannel, newChannel) => {
        if (!oldChannel.guild) return;
        if(oldChannel.name === newChannel.name){
            return;
        }
        const ChannelUpdatedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Channel name Updated\n\nFrom : \`#${oldChannel.name}\`\nTo : \`#${newChannel.name}\`\nChannel ID : \`${oldChannel.id}\`**`)
        oldChannel.guild.channels.cache.get(config.logsChannelID).send({embeds:[ChannelUpdatedEmbed]}).catch(err => console.log(err))
    })

    bot.on("emojiCreate" , emoji => {
        if (!emoji.guild) return;
        const EmojiCreatedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Emoji Created :**`)
        .setImage(emoji.url)
        emoji.guild.channels.cache.get(config.logsChannelID).send({embeds:[EmojiCreatedEmbed]}).catch(err => console.log(err))
        
    })

    bot.on("emojiDelete" , emoji => {
        if (!emoji.guild) return;
        const EmojiDeletedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Emoji Deleted :**`)
        .setImage(emoji.url)
        emoji.guild.channels.cache.get(config.logsChannelID).send({embeds:[EmojiDeletedEmbed]}).catch(err => console.log(err))
    })

    bot.on("emojiUpdate" , (oldEmoji, newEmoji) => {
        if (!oldEmoji.guild) return;
        const EmojiUpdatedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Emoji Updated\n\nFrom : \`:${oldEmoji.name}:\`\nTo : \`:${newEmoji.name}:\`\nEmoji ID : \`${oldEmoji.id}\`**`)
        oldEmoji.guild.channels.cache.get(config.logsChannelID).send({embeds:[EmojiUpdatedEmbed]}).catch(err => console.log(err))
    })

    bot.on('messageDelete' , message => {
        if (!message.guild) return;
        if (message.author.bot) return;
        const MessageDeletedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Message Deleted : \n\nMessage Was : \`${message.content}\`\n Was Sent By : \`${message.author.tag} (${message.author.id})\`**`)
        .setTimestamp()
        message.guild.channels.cache.get(config.logsChannelID).send({embeds:[MessageDeletedEmbed]}).catch(err => console.log(err))
    })

    bot.on('messageUpdate' , (oldMessage, newMessage) => {
        if (!oldMessage.guild) return;
        const MessageUpdatedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Message Updated\n\nFrom : \`${oldMessage.content}\`\nTo : \`${newMessage.content}\`\nWas Sent By : \`${oldMessage.author.tag} (${oldMessage.author.id})\`**`)
        .setTimestamp()
        oldMessage.guild.channels.cache.get(config.logsChannelID).send({embeds:[MessageUpdatedEmbed]}).catch(err => console.log(err))
    })

    bot.on("messageDeleteBulk" , messages => {
        if (!messages.guild) return;
        const MessageBulkDeletedEmbed = new Discord.MessageEmbed()
        // let messagesArray = messages.array()
        console.log(messagesArray)
        .setColor("BLUE")
        .setDescription(`**${messages.size} Messages Deleted**`)
        .setTimestamp()
        messages.guild.channels.cache.get(config.logsChannelID).send({embeds:[MessageBulkDeletedEmbed]}).catch(err => console.log(err))
    })

    bot.on("roleCreate" , async role => {
        if (!role.guild) return;

        const fetched = await role.guild.fetchAuditLogs({
            limit : 1,
            type : "ROLE_CREATE"
        })

        const RoleCreatedLog = fetched.entries.first()

        const { executor  } = RoleCreatedLog
        // console.log(executor)
        // console.log(role)


        const RoleCreatedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Role Created : <@&${role.id}>\nCreated By : <@${executor.id}>**`)
        role.guild.channels.cache.get(config.logsChannelID).send({embeds:[RoleCreatedEmbed]}).catch(err => console.log(err))
    })

    bot.on("roleDelete" , async role => {
        if (!role.guild) return;
        const fetched = await role.guild.fetchAuditLogs({
            limit : 1,
            type : "ROLE_DELETE"
        })

        const RoleDeletedLog = fetched.entries.first()

        const { executor  } = RoleDeletedLog

        const RoleDeletedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Role Deleted : @${role.name}\nDeleted By : <@${executor.id}>**`)
        role.guild.channels.cache.get(config.logsChannelID).send({embeds:[RoleDeletedEmbed]}).catch(err => console.log(err))
    })

    bot.on("roleUpdate" , async (oldRole, newRole) => {
        if (!oldRole.guild) return;
        const fetched = await oldRole.guild.fetchAuditLogs({
            limit : 1,
            type : "ROLE_UPDATE"
        })

        const RoleUpdatedLog = fetched.entries.first()

        const { executor  } = RoleUpdatedLog

        const RoleUpdatedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Role Updated\n\nFrom : \`${oldRole.name}\`\nTo : \`${newRole.name}\`\nUpdated By : \`${executor.tag}\`**`)
        oldRole.guild.channels.cache.get(config.logsChannelID).send({embeds:[RoleUpdatedEmbed]}).catch(err => console.log(err))
    })

    bot.on("messageReactionAdd" , (messageReaction , user) => {
        if (!messageReaction.message.guild) return;
        const MessageReactionAddedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Message Reaction Added\n\nMessage : \`${messageReaction.message.content}\`\nReaction : \`${messageReaction.emoji}\`\nReacted By : \`${user.tag} (${user.id})\`**`)
        messageReaction.message.guild.channels.cache.get(config.logsChannelID).send({embeds:[MessageReactionAddedEmbed]}).catch(err => console.log(err))
    })
    
    bot.on("messageReactionRemove" , (messageReaction , user) => {
        if (!messageReaction.message.guild) return;
        const MessageReactionRemovedEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`**Message Reaction Removed\n\nMessage : \`${messageReaction.message.content}\`\nReaction : \`${messageReaction.emoji}\`\nReacted By : \`${user.tag} (${user.id})\`**`)
        messageReaction.message.guild.channels.cache.get(config.logsChannelID).send({embeds:[MessageReactionRemovedEmbed]}).catch(err => console.log(err))
    })

   
bot.login(config.token).catch(err => console.log(err))
