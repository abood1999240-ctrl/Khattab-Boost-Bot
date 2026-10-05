require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require("discord.js");


// ==================================================
// SETTINGS
// ==================================================

const TOKEN = process.env.DISCORD_TOKEN;

const PANEL_CHANNEL_ID = "1556522542842511512";

// اختياري:
// ضع ID الكاتيجوري هنا إذا تبي التذاكر تدخل كاتيجوري معين
const TICKET_CATEGORY_ID = "";

// اختياري:
// ضع ID رتبة الموظفين هنا إذا تبي يشوفون التذاكر
const BOOST_STAFF_ROLE_ID = "";

// السعر الإضافي للـ Reward
const REWARD_EXTRA = 10;


// ==================================================
// RANKS
// ==================================================

const RANKS = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond I",
  "Diamond II",
  "Diamond III",
  "Champion I",
  "Champion II",
  "Champion III",
  "Grand Champion I",
  "Grand Champion II",
  "Grand Champion III",
  "SSL"
];


// ==================================================
// PRICES
// ==================================================

const PRICES = {
  Bronze: {
    Silver: 10,
    Gold: 20,
    Platinum: 35,
    "Diamond I": 50,
    "Diamond II": 65,
    "Diamond III": 80,
    "Champion I": 100,
    "Champion II": 125,
    "Champion III": 150,
    "Grand Champion I": 180,
    "Grand Champion II": 220,
    "Grand Champion III": 260,
    SSL: 320
  },

  Silver: {
    Gold: 10,
    Platinum: 25,
    "Diamond I": 40,
    "Diamond II": 55,
    "Diamond III": 70,
    "Champion I": 90,
    "Champion II": 115,
    "Champion III": 140,
    "Grand Champion I": 170,
    "Grand Champion II": 210,
    "Grand Champion III": 250,
    SSL: 310
  },

  Gold: {
    Platinum: 15,
    "Diamond I": 30,
    "Diamond II": 45,
    "Diamond III": 60,
    "Champion I": 80,
    "Champion II": 105,
    "Champion III": 130,
    "Grand Champion I": 160,
    "Grand Champion II": 200,
    "Grand Champion III": 240,
    SSL: 300
  },

  Platinum: {
    "Diamond I": 20,
    "Diamond II": 35,
    "Diamond III": 50,
    "Champion I": 70,
    "Champion II": 95,
    "Champion III": 120,
    "Grand Champion I": 150,
    "Grand Champion II": 190,
    "Grand Champion III": 230,
    SSL: 290
  },

  "Diamond I": {
    "Diamond II": 15,
    "Diamond III": 30,
    "Champion I": 50,
    "Champion II": 75,
    "Champion III": 100,
    "Grand Champion I": 130,
    "Grand Champion II": 170,
    "Grand Champion III": 210,
    SSL: 270
  },

  "Diamond II": {
    "Diamond III": 15,
    "Champion I": 35,
    "Champion II": 60,
    "Champion III": 85,
    "Grand Champion I": 115,
    "Grand Champion II": 155,
    "Grand Champion III": 195,
    SSL: 255
  },

  "Diamond III": {
    "Champion I": 25,
    "Champion II": 50,
    "Champion III": 75,
    "Grand Champion I": 105,
    "Grand Champion II": 145,
    "Grand Champion III": 185,
    SSL: 245
  },

  "Champion I": {
    "Champion II": 25,
    "Champion III": 50,
    "Grand Champion I": 80,
    "Grand Champion II": 120,
    "Grand Champion III": 160,
    SSL: 220
  },

  "Champion II": {
    "Champion III": 25,
    "Grand Champion I": 55,
    "Grand Champion II": 95,
    "Grand Champion III": 135,
    SSL: 195
  },

  "Champion III": {
    "Grand Champion I": 30,
    "Grand Champion II": 70,
    "Grand Champion III": 110,
    SSL: 170
  },

  "Grand Champion I": {
    "Grand Champion II": 40,
    "Grand Champion III": 80,
    SSL: 140
  },

  "Grand Champion II": {
    "Grand Champion III": 40,
    SSL: 100
  },

  "Grand Champion III": {
    SSL: 60
  }
};


// ==================================================
// CLIENT
// ==================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});


// ==================================================
// PANEL
// ==================================================

function createPanel() {

  const embed = new EmbedBuilder()
    .setTitle("Khattab Boost")
    .setDescription(
      "اختر رتبتك الحالية والرتبة المطلوبة لبدء طلب البوست.\n\n" +
      "سيتم حساب السعر تلقائيًا قبل تأكيد الطلب."
    )
    .setColor(0x5865f2);

  const button = new ButtonBuilder()
    .setCustomId("start_boost")
    .setLabel("Start Boost")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder()
    .addComponents(button);

  return {
    embeds: [embed],
    components: [row]
  };
}


// ==================================================
// CURRENT RANK MENU
// ==================================================

function currentRankMenu() {

  const menu = new StringSelectMenuBuilder()
    .setCustomId("current_rank")
    .setPlaceholder("Select your current rank")
    .addOptions(
      RANKS.map(rank => ({
        label: rank,
        value: rank
      }))
    );

  return new ActionRowBuilder()
    .addComponents(menu);
}


// ==================================================
// DESIRED RANK MENU
// ==================================================

function desiredRankMenu(currentRank) {

  const availableRanks = RANKS.filter(rank => {

    if (rank === currentRank) {
      return false;
    }

    if (!PRICES[currentRank]) {
      return false;
    }

    return PRICES[currentRank][rank] !== undefined;
  });

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`desired_rank|${currentRank}`)
    .setPlaceholder("Select your desired rank")
    .addOptions(
      availableRanks.map(rank => ({
        label: rank,
        value: rank
      }))
    );

  return new ActionRowBuilder()
    .addComponents(menu);
}


// ==================================================
// REWARD MENU
// ==================================================

function rewardMenu(currentRank, desiredRank) {

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`reward|${currentRank}|${desiredRank}`)
    .setPlaceholder("Select reward option")
    .addOptions([
      {
        label: "With Reward",
        description: `Add ${REWARD_EXTRA} SAR`,
        value: "with_reward"
      },
      {
        label: "Without Reward",
        description: "No additional reward",
        value: "without_reward"
      }
    ]);

  return new ActionRowBuilder()
    .addComponents(menu);
}


// ==================================================
// GET PRICE
// ==================================================

function getPrice(currentRank, desiredRank, reward) {

  if (!PRICES[currentRank]) {
    return null;
  }

  if (PRICES[currentRank][desiredRank] === undefined) {
    return null;
  }

  let price = PRICES[currentRank][desiredRank];

  if (reward === "with_reward") {
    price += REWARD_EXTRA;
  }

  return price;
}


// ==================================================
// BOT READY
// ==================================================

client.once("ready", async () => {

  console.log(
    `Khattab Boost is online as ${client.user.tag}`
  );

  try {

    const channel =
      await client.channels.fetch(PANEL_CHANNEL_ID);

    if (!channel) {
      console.log(
        "Panel channel was not found."
      );
      return;
    }

    if (!channel.isTextBased()) {
      console.log(
        "Panel channel is not a text channel."
      );
      return;
    }

    const messages =
      await channel.messages.fetch({
        limit: 50
      });

    const existingPanel =
      messages.find(message => {

        if (message.author.id !== client.user.id) {
          return false;
        }

        return message.components?.some(row =>
          row.components?.some(
            component =>
              component.customId === "start_boost"
          )
        );
      });

    if (!existingPanel) {

      await channel.send(
        createPanel()
      );

      console.log(
        "Boost panel sent successfully."
      );

    } else {

      console.log(
        "Boost panel already exists."
      );

    }

  } catch (error) {

    console.error(
      "Failed to send boost panel:"
    );

    console.error(error);

  }

});


// ==================================================
// INTERACTIONS
// ==================================================

client.on(
  "interactionCreate",
  async interaction => {


    // ==================================================
    // START BOOST
    // ==================================================

    if (
      interaction.isButton() &&
      interaction.customId === "start_boost"
    ) {

      await interaction.reply({
        content:
          "اختر رتبتك الحالية:",
        components: [
          currentRankMenu()
        ],
        ephemeral: true
      });

      return;
    }


    // ==================================================
    // CURRENT RANK
    // ==================================================

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "current_rank"
    ) {

      const currentRank =
        interaction.values[0];

      await interaction.update({

        content:
          `رتبتك الحالية: **${currentRank}**\n\n` +
          "اختر الرتبة التي تريد الوصول إليها:",

        components: [
          desiredRankMenu(currentRank)
        ]

      });

      return;
    }


    // ==================================================
    // DESIRED RANK
    // ==================================================

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId.startsWith(
        "desired_rank|"
      )
    ) {

      const currentRank =
        interaction.customId.split("|")[1];

      const desiredRank =
        interaction.values[0];

      await interaction.update({

        content:
          `Current Rank: **${currentRank}**\n` +
          `Desired Rank: **${desiredRank}**\n\n` +
          "اختر نوع الطلب:",

        components: [
          rewardMenu(
            currentRank,
            desiredRank
          )
        ]

      });

      return;
    }


    // ==================================================
    // REWARD
    // ==================================================

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId.startsWith(
        "reward|"
      )
    ) {

      const parts =
        interaction.customId.split("|");

      const currentRank =
        parts[1];

      const desiredRank =
        parts[2];

      const reward =
        interaction.values[0];


      const price =
        getPrice(
          currentRank,
          desiredRank,
          reward
        );


      if (price === null) {

        await interaction.update({

          content:
            "هذا الطلب غير متوفر حاليًا.",

          components: []

        });

        return;
      }


      const rewardText =
        reward === "with_reward"
          ? "With Reward"
          : "Without Reward";


      const embed =
        new EmbedBuilder()

          .setTitle(
            "Khattab Boost"
          )

          .setDescription(
            "راجع تفاصيل طلبك قبل التأكيد."
          )

          .addFields(

            {
              name: "Current Rank",
              value: currentRank,
              inline: true
            },

            {
              name: "Desired Rank",
              value: desiredRank,
              inline: true
            },

            {
              name: "Reward",
              value: rewardText,
              inline: true
            },

            {
              name: "Total",
              value: `${price} SAR`,
              inline: false
            }

          )

          .setColor(
            0x5865f2
          );


      const confirmButton =
        new ButtonBuilder()

          .setCustomId(
            `confirm_boost|${currentRank}|${desiredRank}|${reward}`
          )

          .setLabel(
            "Confirm Order"
          )

          .setStyle(
            ButtonStyle.Success
          );


      const cancelButton =
        new ButtonBuilder()

          .setCustomId(
            "cancel_boost"
          )

          .setLabel(
            "Cancel"
          )

          .setStyle(
            ButtonStyle.Danger
          );


      const row =
        new ActionRowBuilder()
          .addComponents(
            confirmButton,
            cancelButton
          );


      await interaction.update({

        content: "",

        embeds: [
          embed
        ],

        components: [
          row
        ]

      });

      return;
    }


    // ==================================================
    // CANCEL
    // ==================================================

    if (
      interaction.isButton() &&
      interaction.customId === "cancel_boost"
    ) {

      await interaction.update({

        content:
          "تم إلغاء الطلب.",

        embeds: [],

        components: []

      });

      return;
    }


    // ==================================================
    // CONFIRM ORDER
    // ==================================================

    if (
      interaction.isButton() &&
      interaction.customId.startsWith(
        "confirm_boost|"
      )
    ) {

      const parts =
        interaction.customId.split("|");


      const currentRank =
        parts[1];

      const desiredRank =
        parts[2];

      const reward =
        parts[3];


      const price =
        getPrice(
          currentRank,
          desiredRank,
          reward
        );


      if (price === null) {

        await interaction.reply({

          content:
            "حدث خطأ في حساب السعر.",

          ephemeral: true

        });

        return;
      }


      const rewardText =
        reward === "with_reward"
          ? "With Reward"
          : "Without Reward";


      const guild =
        interaction.guild;


      if (!guild) {

        await interaction.reply({

          content:
            "حدث خطأ: السيرفر غير موجود.",

          ephemeral: true

        });

        return;
      }


      // ==================================================
      // TICKET NAME
      // ==================================================

      let username =
        interaction.user.username
          .toLowerCase()
          .replace(
            /[^a-z0-9-_]/g,
            ""
          );

      if (!username) {
        username = "customer";
      }

      const ticketName =
        `boost-${username}`.slice(
          0,
          90
        );


      // ==================================================
      // TICKET PERMISSIONS
      // ==================================================

      const permissionOverwrites = [

        {
          id:
            guild.roles.everyone.id,

          deny: [
            PermissionsBitField.Flags.ViewChannel
          ]
        },

        {
          id:
            interaction.user.id,

          allow: [

            PermissionsBitField.Flags.ViewChannel,

            PermissionsBitField.Flags.SendMessages,

            PermissionsBitField.Flags.ReadMessageHistory

          ]
        }

      ];


      // ==================================================
      // STAFF ROLE
      // ==================================================

      if (BOOST_STAFF_ROLE_ID) {

        permissionOverwrites.push({

          id:
            BOOST_STAFF_ROLE_ID,

          allow: [

            PermissionsBitField.Flags.ViewChannel,

            PermissionsBitField.Flags.SendMessages,

            PermissionsBitField.Flags.ReadMessageHistory

          ]

        });

      }


      // ==================================================
      // CREATE TICKET
      // ==================================================

      try {

        const ticket =
          await guild.channels.create({

            name:
              ticketName,

            type:
              ChannelType.GuildText,

            ...(TICKET_CATEGORY_ID
              ? {
                  parent:
                    TICKET_CATEGORY_ID
                }
              : {}),

            permissionOverwrites:
              permissionOverwrites

          });


        // ==================================================
        // ORDER EMBED
        // ==================================================

        const orderEmbed =
          new EmbedBuilder()

            .setTitle(
              "Khattab Boost"
            )

            .setDescription(
              `طلب Boost جديد من ${interaction.user}`
            )

            .addFields(

              {
                name:
                  "Customer",

                value:
                  `${interaction.user}`,

                inline:
                  false
              },

              {
                name:
                  "Current Rank",

                value:
                  currentRank,

                inline:
                  true
              },

              {
                name:
                  "Desired Rank",

                value:
                  desiredRank,

                inline:
                  true
              },

              {
                name:
                  "Reward",

                value:
                  rewardText,

                inline:
                  true
              },

              {
                name:
                  "Total",

                value:
                  `${price} SAR`,

                inline:
                  false
              }

            )

            .setColor(
              0x57f287
            )

            .setTimestamp();


        // ==================================================
        // CLOSE BUTTON
        // ==================================================

        const closeButton =
          new ButtonBuilder()

            .setCustomId(
              "close_ticket"
            )

            .setLabel(
              "Close Ticket"
            )

            .setStyle(
              ButtonStyle.Danger
            );


        const closeRow =
          new ActionRowBuilder()
            .addComponents(
              closeButton
            );


        // ==================================================
        // SEND TICKET
        // ==================================================

        await ticket.send({

          content:
            `${interaction.user}`,

          embeds: [
            orderEmbed
          ],

          components: [
            closeRow
          ]

        });


        // ==================================================
        // SUCCESS
        // ==================================================

        await interaction.update({

          content:
            `تم إنشاء طلبك بنجاح.\n\n${ticket}`,

          embeds: [],

          components: []

        });


      } catch (error) {

        console.error(
          "Failed to create ticket:"
        );

        console.error(
          error
        );


        if (
          !interaction.replied &&
          !interaction.deferred
        ) {

          await interaction.reply({

            content:
              "حدث خطأ أثناء إنشاء التذكرة.\n" +
              "تأكد أن البوت لديه صلاحية Manage Channels.",

            ephemeral: true

          });

        }

      }

      return;
    }


    // ==================================================
    // CLOSE TICKET
    // ==================================================

    if (
      interaction.isButton() &&
      interaction.customId === "close_ticket"
    ) {


      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      ) {

        await interaction.reply({

          content:
            "ما عندك صلاحية لإغلاق التذكرة.",

          ephemeral: true

        });

        return;
      }


      await interaction.reply({

        content:
          "سيتم إغلاق التذكرة...",

        ephemeral: true

      });


      setTimeout(
        async () => {

          try {

            await interaction.channel.delete();

          } catch (error) {

            console.error(
              "Failed to delete ticket:"
            );

            console.error(
              error
            );

          }

        },
        1500
      );


      return;
    }

  }
);


// ==================================================
// TOKEN CHECK
// ==================================================

if (!TOKEN) {

  console.error(
    "DISCORD_TOKEN is not set."
  );

  console.error(
    "Check your .env file."
  );

  console.error(
    "It should contain:"
  );

  console.error(
    "DISCORD_TOKEN=YOUR_BOT_TOKEN"
  );

  process.exit(1);
}


// ==================================================
// LOGIN
// ==================================================

client.login(TOKEN);