const Discord = require('discord.js')
const config = require('./Data/config.json')
const intents = new Discord.Intents(["GUILDS" , "GUILD_MESSAGES" , "GUILD_MESSAGE_REACTIONS" , "GUILD_MEMBERS" , "GUILD_VOICE_STATES"])
const bot = new Discord.Client({intents})

bot.on('ready' , () => console.log('Bot is ready'))
bot.on('messageCreate' , message =>{
    if(message.mentions.has(bot.user.id)){
        const PingedEmbed = {
            color : "RANDOM",
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
        .setColor('RANDOM')
        
        .setDescription(`${config.SuccessEmoji} Latency is \`${Date.now() - message.createdTimestamp}\`ms. API Latency is \`${Math.round(bot.ws.ping)}\`ms`).catch(err => console.log(err))
        message.channel.send({embeds : [PingEmbed]}).catch(err => console.log(err))
    }
     
// <---------------------------- PURGE COMMAND ----------------------------------->

    if (command === 'purge' || command === 'delete' && message.member.permissions.has('MANAGE_MESSAGES')){
        const amount = args[0]
        if(message){
            message.delete()
        }
        const PurgeAmountNotANumber ={
            color :"RANDOM",
            description :`${config.crossEmoji} **Please enter the value between \`1\` to \`100\` to delete messages**`
        }
        if(isNaN(amount) || amount < 0 || amount > 100){
            message.channel.send({embeds:[PurgeAmountNotANumber]}).catch(err => console.log(err))
            return
        }
        
        const NoTargetForPurge = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`${config.crossEmoji} ** Please Provide Number of Messages you want to purge / delete.\n\n__Usage__ : \n\n\`${config.prefix}purge <amount of messages>\`\n\`${config.prefix}purge 69\`\n\`${config.prefix}delete 69\`**`)
        .setFooter(`Note : Bot will ignore the command if you type anything except number of messages.`)
        if(!args[0]){
            message.channel.send({embeds: [NoTargetForPurge]}).catch(err => console.log(err))
        }
        // if (!isNaN(args[0])) return message.channel.send(`${config.crossEmoji} **Please enter a valid number**`)

        else{
            message.channel.bulkDelete(amount , true).catch(err => console.log(err))
        const PurgeEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`${config.SuccessEmoji} **Deleted \`${amount}\` message(s)**`).catch(err => console.log(err))
        message.channel.send({embeds : [PurgeEmbed]}).catch(err => console.log(err))
        }
        
        
    }



// <---------------------------- MEMBERCOUNT COMMAND ----------------------------------->

if (command === "membercount" || command === "mc" && message.member.permissions.has("ADMINISTRATOR")){
    let GuildID = message.guild.id
    // let memberCount = bot.guilds.cache.get(GuildID).members.cache.filter(member => !member.user.bot).size;
    let BotsInServer = bot.guilds.cache.get(GuildID).members.cache.filter(member => member.user.bot).size;

        const MemberCountEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**Total Members in Server : \`${message.guild.memberCount}\`\nCurrent Bots in Server : \`${BotsInServer}\`**`).catch(err => console.log(err))
        message.channel.send({embeds: [MemberCountEmbed]}).catch(err => console.log(err))
    }



// <---------------------------- KICK COMMAND ----------------------------------->


    if(command === "kick"){
        let Mod = message.member.roles.cache.has(config.modRoleID) ||  message.member.permissions.has("KICK_MEMBERS")
        let reason = args.slice(1).join(" ");

        const NotModEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`${config.crossEmoji} **You do not have Moderator Role / Permission to Kick Members**`).catch(err => console.log(err))
        if (!Mod){
            message.channel.send({embeds : [NotModEmbed]}).catch(err => console.log(err))
        }
        if (Mod){
            let Target = message.mentions.members.first() || args[0]
            if (!Target){
                const Nottarget = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setDescription(`${config.crossEmoji}**Please Mention someone to Kick\n\n__Usage__ : \n\n\`${config.prefix}kick @user\`\n\`${config.prefix}kick @Pratikk@6969\`**`).cache(err => console.log(err))

                message.channel.send({embeds : [Nottarget]}).catch(err => console.log(err))
            }
            else{
                if (!reason){
                    reason = "No Reason Provided"
                }
                Target.kick(reason).catch(err => console.log(err))
                const KickedEmbed = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setDescription(`${config.SuccessEmoji} **${Target} has been kicked.**\n\n**By : \`${message.author.username}\`\nReason : \`${reason}\`**`).catch(err => console.log(err))
                message.channel.send({embeds:[KickedEmbed]}).catch(err => console.log(err))

                const KickedDMEmbed = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setDescription(`**You have been kicked from __${message.guild}__.**\n\n**By : \`${message.author.username}\`\nReason : \`${reason}\`**`).catch(err => console.log(err))
                Target.send({embeds:[KickedDMEmbed]}).catch(err => console.log(err))
                
            }
        }
    }


// <---------------------------- BAN COMMAND ----------------------------------->



    if(command === "ban"){
        let Mod = message.member.roles.cache.has(config.modRoleID) ||  message.member.permissions.has("BAN_MEMBERS")
        let reason = args.slice(1).join(" ");
        

        const NotModEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`${config.crossEmoji} **You do not have Moderator Role / Permission to BAN Members**`)
        if (!Mod){
            message.channel.send({embeds : [NotModEmbed]}).catch(err => console.log(err))
        }
        if (Mod){
            let Target = message.mentions.members.first() || args[0]
            
            if (!Target){
                const Nottarget = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setDescription(`${config.crossEmoji}**Please Mention someone to Ban\n\n__Usage__ : \n\n\`${config.prefix}ban @user\`\n\`${config.prefix}ban @Pratikk@6969\`**`).catch(err => console.log(err))

                message.channel.send({embeds : [Nottarget]})
            }
        if (Target.id === bot.user.id){
        message.channel.send(`${config.crossEmoji}** You cannot ban me with my commands XD :joy:**`)
        return
    }
            else{
                if (!reason){
                    reason = "No Reason Provided"
                }
                Target.ban(reason).catch(err => console.log(err))
                const BannedEmbed = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setDescription(`${config.SuccessEmoji} **${Target} has been banned.**\n\n**By : \`${message.author.username}\`\nReason : \`${reason}\`**`)
                message.channel.send({embeds:[BannedEmbed]}).catch(err => console.log(err))

                const BannedDMEmbed = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setDescription(`**You have been banned from __${message.guild}__.**\n\n**By : \`${message.author.username}\`\nReason : \`${reason}\`**`)
                Target.send({embeds:[BannedDMEmbed]}).catch(err => console.log(err))
                
            }
        }
    }


// <---------------------------- PULL COMMAND ----------------------------------->


    if (command === "pull" && message.member.permissions.has("MOVE_MEMBERS")){
        if(!message.member.permissions.has('MOVE_MEMBERS')) return;

        const member = message.mentions.members.first();
        if(!member){
            message.channel.send('Please mention a member that you want to pull in your vc!');
        }
        const ModNotInVC = {
            color:"RANDOM",
            description: `**${config.crossEmoji} ${message.author} , you need join a voice channel before you can actually pull an user**`
            
        }
        if(!message.member.voice.channel){
            message.channel.send({embeds : [ModNotInVC]});
            return
        }

        if(!member.voice.channel){
            const TargetNotInVC ={
                color : "RANDOM",
                description:`**${config.crossEmoji} ${member} is not in any Voice Channel to Pull them.**`
            }
            message.channel.send({embeds:[TargetNotInVC]}).catch(err => console.log(err)) 
            return
        }
        
        
        if(message.member.voice.channel === member.voice.channel) {
            const UserAlreadyInYourVC = {
                color :"RANDOM",
                description:`** ${config.crossEmoji} ${member} is already present in your Voice Channel.**`
            }
            message.channel.send({embeds:[UserAlreadyInYourVC]})
            return
        }
        member.voice.setChannel(message.member.voice.channel).catch(err => console.log(err)) 
            const MovedEmbed = new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setDescription(`${config.SuccessEmoji} **Pulled ${member} to your Voice Channel.**`)

            message.channel.send({embeds:[MovedEmbed]})


        }



// <---------------------------- DISCONNECT COMMAND ----------------------------------->


    if (command === "disconnect" || command === "dc"){
        
        if (!message.member.permissions.has("MOVE_MEMBERS") || !message.member.roles.cache.has(config.modRoleID)){
            return
        }
        
        const member = message.mentions.members.first();

        if(!member.voice.channel) {
        const UserNotInVCtoDisconnect = {
            color:"RANDOM",
            description:`**${config.crossEmoji} ${message.author} , they need be in a voice channel before you can actually disconnect an user**`
        }
        message.channel.send({embeds:[UserNotInVCtoDisconnect]})
        return;
    }
        member.voice.disconnect().catch(err => console.log(err))
        const DisconnectedEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`${config.SuccessEmoji} **Disconnected ${member} from Voice Channel ${member.voice.channel}**`)
        message.channel.send({embeds:[DisconnectedEmbed]}).catch(err => console.log(err))
        const DisconnectedLog = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**${member} has been disconnected from Voice Channel ${member.voice.channel}**`)

        message.guild.channels.cache.get(config.logsChannelID).send({embeds:[DisconnectedLog]})
    }
    
    
})

    bot.on("channelCreate" , channel => {
        if (!channel.guild) return;
        const ChannelCreatedEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**Channel Created : ${channel}**`)
        channel.guild.channels.cache.get(config.logsChannelID).send({embeds:[ChannelCreatedEmbed]}).catch(err => console.log(err))
    })

    bot.on("channelDelete" , channel => {
        if (!channel.guild) return;
        const ChannelDeletedEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**Channel Deleted : ${channel}**`)
        channel.guild.channels.cache.get(config.logsChannelID).send({embeds:[ChannelDeletedEmbed]}).catch(err => console.log(err))
    })

    bot.on("channelUpdate" , (oldChannel, newChannel) => {
        if (!oldChannel.guild) return;
        const ChannelUpdatedEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**Channel name Updated : ${oldChannel} **`)
        oldChannel.guild.channels.cache.get(config.logsChannelID).send({embeds:[ChannelUpdatedEmbed]}).catch(err => console.log(err))
    })

    bot.on("guildBanAdd" , (guild, user) => {
        const UserBannedEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**User Banned : ${user}**`)
        guild.channels.cache.get(config.logsChannelID).send({embeds:[UserBannedEmbed]}).catch(err => console.log(err))
    })
bot.login(config.token).catch(err => console.log(err))