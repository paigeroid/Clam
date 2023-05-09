var { psc, bot } = require('../../index.js');
var { colors, emojis, isDev, emojify } = require('../assets');

var { icon } = require('../../config/defaults.json');
var { version, versionText } = require('../../config/config.json');
var { Catch } = require('../classes');

const { Soup } = require('stews');


async function data(ctx, cmd) {	
	/* handling */
	if ( Catch( cmd.onCooldown, { 
		head: `Woah there!  :face_with_spiral_eyes:`,
		text: `You've been timed out from using this command for a bit.`
	}) ) return;
	
	
	var category = "General";
	var stuff = Soup.from(require('../../config/list.json')[category]);
	var all = Soup.from(Soup.from(require('../../config/list.json')));

	var prefixes = require('../../config/prefixes.json');
	var prefix = (prefixes instanceof Object && prefixes[ctx.guild.id]) ? prefixes[ctx.guild.id] : (prefixes instanceof Object) ? prefixes.default : prefixes;

	let disabled = !(psc.author.hasPermissions(["admin"]) || isDev(ctx.author.id));
	if (disabled) all.delete("Administrator");


	/* button shit */
	let general = new psc.Button({ id: `clamHelp/General/${ctx.guild.id}`, emoji: "👥", style: "secondary"});
	let manage = new psc.Button({ id: `clamHelp/Management/${ctx.guild.id}`, emoji: "🛠️", style: "secondary"});
	let mod = new psc.Button({ id: `clamHelp/Moderation/${ctx.guild.id}`, emoji: "🛡️", style: "secondary"});
	let economy = new psc.Button({ id: `clamHelp/Economy/${ctx.guild.id}`, emoji: "💰", style: "secondary"});
	let admin = new psc.Button({ id: `clamHelp/Administrator/${ctx.guild.id}`, emoji: (disabled) ? "🔒" : "🔓", style: "danger", disabled: disabled});


	/* select menu shit */
	var options = [];

	if (cmd.args[0]) {
		var the = all.values.flat().filter( (v) => { return v.name == cmd.args[0] });

		if ( Catch( this.length <= 0, { text: "I couldn't find a command with that name." }) ) return;
		
		[ category, stuff ] = all.filter( (_, c) => {
			return c.includes(the[0]);
		}).pour(Array)[0];

		stuff = Soup.from(stuff);
	}
	
	stuff.forEach( (com) => {
		options.push({
			label: `${prefix}${com.name}`,
			value: `clamSearch/${category}/${com.name}/${ctx.guild.id}`,
			description: com.desc
		});
	});

	let search = new psc.Selection({
		id: "helpSearch",
		placeholder: `Search ${category}`,
		options: options,
		min: 1,
		max: 1
	});


	/* more button shit */
	var btns = [ general, manage, mod, economy, admin ];
	var comps = [ [search], btns ];

	comps = comps.map( (btns) => { return new psc.ActionRow(btns); });
	
	var desc = stuff.copy().map( (com) => {
		return `${prefix}${com.name}: ${ "`"+com.desc+"`" }`;
	});
	

	/* embed stuff */
	var embed;
	
	if (cmd.args[0]) {
		let titleName = cmd.args[0].split("");titleName[0]=titleName[0].toUpperCase();titleName=titleName.join("");
		
		embed = new psc.Embed({
			title: `${titleName} Command`,
			
			fields: [
				{ name: "Description", value: `• ${the[0].desc}`, inline: true },
				{ name: "Category", value: `• ${category}`, inline: true },
				{ name: "** **", value: "** **", inline: true },
				{ name: "Arguments", value: (the[0].args.length > 0) ? "• `"+the[0].args.join("`, `")+"`" : "• None", inline: true },
				{ name: "Aliases", value: (the[0].aliases.length > 0) ? `• ${prefix}`+the[0].aliases.join(`, ${prefix}`) : "• None", inline: true },
				{ name: "** **", value: "** **", inline: false }
			],

			footer: `${versionText} v${version}`,
			thumbnail: icon,
			
			color: colors.clam
		});
	}
	
	else {
		embed = new psc.Embed({
			title: `${category} Commands  ${emojify(category)}`,
			description: desc.join("\n"),
	
			fields: [
				{ name: "** **", value: "** **" }
			],
			
			footer: `${versionText} v${version}`,
			thumbnail: icon,
	
			color: colors.clam
		});
	}


	/* the dming */
	try {
		await ctx.author.send({ embeds: [embed], components: comps }).catch(e=>{});
	}
	catch(err) {
		return psc.reply({ embeds: [
			new psc.Embed({
				description: `${emojis.fail} Your DMs are off so I can't send you the stuff :(`,
				color: colors.fail
			})
		], deleteAfter: "3s" }).catch(e=>{});
	}

	psc.reply({embeds: [{
		color: 0x3498DB,
		description: `Check the DM I sent you!`,
	}],
		deleteAfter: "5s"
	}).catch(e=>{});
}

psc.command({ name: "help", cooldown: "3s"}, data);
