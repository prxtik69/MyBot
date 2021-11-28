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
    bot.user.setActivity("on Pratik's Localhost" , {
        type:"STREAMING",
        url:"https://www.twitch.tv/discord"
    })
    
})

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
        .setColor("RANDOM")
        .setDescription(`**Total Members in Server : \`${message.guild.memberCount}\`\nCurrent Bots in Server : \`${BotsInServer}\`**`)
        message.channel.send({embeds: [MemberCountEmbed]}).catch(err => console.log(err))
    }



// <---------------------------- KICK COMMAND ----------------------------------->


    if(command === "kick"){
        let Mod = message.member.roles.cache.has(config.modRoleID) ||  message.member.permissions.has("KICK_MEMBERS")
        let reason = args.slice(1).join(" ");

        const NotModEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`${config.crossEmoji} **You do not have Moderator Role / Permission to Kick Members**`)
        if (!Mod){
            message.channel.send({embeds : [NotModEmbed]}).catch(err => console.log(err))
        }
        if (Mod){
            let Target = message.mentions.members.first() || args[0]
            if (!Target){
                const Nottarget = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setDescription(`${config.crossEmoji}**Please Mention someone to Kick\n\n__Usage__ : \n\n\`${config.prefix}kick @user\`\n\`${config.prefix}kick @Pratikk@6969\`**`)

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

    if (command === "ban"){
        const NoBanPermsEmbed = {
            color:"RANDOM",
            description:`${config.crossEmoji} ** You do not have permissions to ban a user.**`
        }
        const NoTargetEmbed = {
            color:"RANDOM",
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
                color:"RANDOM",
                description:`${config.SuccessEmoji} **Banned ${Target}\n\nBy : \`${message.author.username}\`\nFor : \`${reason}\`**`
            }
            const BannedDMEmbed = {
                color:"RANDOM",
                description:`**You have been Banned from ${message.guild}\n\nBy : \`${message.author.username}\`\nFor : \`${reason}\`**`
            }

            Target.ban({ days: 7, reason: 'They deserved it' })
  .then(console.log)
  .catch(console.error);
            
            message.channel.send({embeds : [BannedEmbed]}).then(Target.send({embeds : [BannedDMEmbed]}))

        if(config.logsChannelID){
            const UserBannedEmbed = {
                color:"RANDOM",
                description:`**User Banned : ${Target}**`
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
                color:"RANDOM",
                description:`${config.crossEmoji} **Please mention a member that you want to pull in your vc!**`
            }
            message.channel.send({embeds : [NoTargetToPull]});
            return;
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
        
        const Target = message.mentions.members.first();
        // const TargetID = message.guild.members.cache.get(Target.id);
        // const Targett = message.guild.mem

        if(!Target){
            message.channel.send("ok")
            return;
        }

        if(!Target.voice.channel) {
            // const UserNotInVCtoDisconnect = {
            //     color:"RANDOM",
            //     description:`**${config.crossEmoji} ${message.author} , they need be in a voice channel before you can actually disconnect an user**`
            // }
            const UserNotInVCtoDisconnect = new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setDescription(`**${config.crossEmoji} ${message.author} , they need be in a voice channel before you can actually disconnect an user**`)
            message.channel.send({embeds:[UserNotInVCtoDisconnect]})
            return;
    }
        Target.voice.disconnect().catch(err => console.log(err))
        const DisconnectedEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`${config.SuccessEmoji} **Disconnected ${Target} from Voice Channel ${Target.voice.channel}**`)
        message.channel.send({embeds:[DisconnectedEmbed]}).catch(err => console.log(err))
        const DisconnectedLog = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**${Target} has been disconnected from Voice Channel ${Target.voice.channel}**`)

        message.guild.channels.cache.get(config.logsChannelID).send({embeds:[DisconnectedLog]})
    }
    
    
})

// <---------------------- LOGS -------------------------->


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
        .setDescription(`**Channel Deleted : #${channel.name}**`)
        channel.guild.channels.cache.get(config.logsChannelID).send({embeds:[ChannelDeletedEmbed]}).catch(err => console.log(err))
    })

    bot.on("channelUpdate" , (oldChannel, newChannel) => {
        if (!oldChannel.guild) return;
        const ChannelUpdatedEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**Channel name Updated\n\nFrom : \`#${oldChannel.name}\`\nTo : \`#${newChannel.name}\`\nChannel ID : \`${oldChannel.id}\`**`)
        oldChannel.guild.channels.cache.get(config.logsChannelID).send({embeds:[ChannelUpdatedEmbed]}).catch(err => console.log(err))
    })

    
bot.login(config.token).catch(err => console.log(err))
