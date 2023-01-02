/**
 * @name MemeSounds (Remake)
 * @version 1.0.4
 * @description Plays Memetastic sounds depending on what is being sent in chat. This was heavily inspired by the idea of Metalloriff's bruh plugin so go check him out! this is a remake of Lonk#6942 and FlyMaster#2642 MemeSounds plugin but i added my own sound library
 * @author BallisticOK#8864
 * @authorId 321590712665636865
 * @source https://raw.githubusercontent.com/AtomicGaming666/BetterDiscord/main/Plugins/MemeSounds/MemeSounds(remake).plugin.js
 * @updateUrl https://raw.githubusercontent.com/AtomicGaming666/BetterDiscord/main/Plugins/MemeSounds/MemeSounds(remake).plugin.js
 */
module.exports = (() => {

    /* Configuration */
    const config = {
        info: {
            name: "Meme Sounds (Remake)",
            authors: [{
                name: "BallisticOK#8864",
                discord_id: "321590712665636865",
            }],
            version: "1.0.4",
            description: "Plays Memetastic sounds depending on what is being sent in chat. This was heavily inspired by the idea of Metalloriff's bruh plugin so go check him out!",
            github: "https://raw.githubusercontent.com/AtomicGaming666/BetterDiscord/main/Plugins/MemeSounds/MemeSounds(remake).plugin.js",
            github_raw: "https://raw.githubusercontent.com/AtomicGaming666/BetterDiscord/main/Plugins/MemeSounds/MemeSounds(remake).plugin.js"
        },
        defaultConfig: [{
            id: "setting",
            name: "Sound Settings",
            type: "category",
            collapsible: true,
            shown: true,
            settings: [{
                id: "LimitChan",
                name: "Limit to the current channel only.",
                note: "When enabled, sound effects will only play within the currently selected channel.",
                type: "switch",
                value: true
            }, {
                id: "delay",
                name: "Sound effect delay.",
                note: "The delay in miliseconds between each sound effect.",
                type: "slider",
                value: 200,
                min: 10,
                max: 1000,
                renderValue: v => Math.round(v) + "ms"
            }, {
                id: "volume",
                name: "Sound effect volume.",
                note: "How loud the sound effects will be.",
                type: "slider",
                value: 1,
                min: 0.01,
                max: 1,
                renderValue: v => Math.round(v * 100) + "%"
            }]
        },
        {
            id: "setting",
            name: "Sound Toggle",
            type: "category",
            collapsible: true,
            shown: true,
            settings: [{
                name: "How to toggle sound (TEMP)",
                note: "Just go into the code and look for `const sounds` it sould be close to the top find the sound you want to turn off and put // in front of the `{re:`",
                type: "switch"
            },
            {
                id: "1",
                name: "Bruh",
                note: "Toggle the Bruh sound",
                type: "switch"

            }]

        }
        ],
        changelog: [{
            title: "New Stuff",
            items: ["Added a new sound library.", "Thanks to Lonk#6942 and FlyMaster#2642 for the original code.", "Full List of things to say to trigger `lol,omg,9001,gay,lol,ok,omg,toasty,free,xD,chicken,:moyai:,bruh,oof,bazinga,noice,nice`"]
        }, {
            title: "Coming Soon",
            type: "fixed",
            items: ["Be able to turn off sounds in settings. (NO ETA)"]
        }]
    };

    /* Library Stuff */
    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }
        getName() {
            return config.info.name;
        }
        getAuthor() {
            return config.info.authors.map(a => a.name).join(", ");
        }
        getDescription() {
            return config.info.description;
        }
        getVersion() {
            return config.info.version;
        }
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {
                        if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Api]) => {

        const plugin = (Plugin, Api) => {
            try {

                /* Constants */
                const {
                    DiscordModules: {
                        Dispatcher,
                        SelectedChannelStore
                    }
                } = Api;
                const sounds = [{
                    re: /no?ice/gmi,
                    file: "noice.mp3",
                    duration: 600,
                },
                {
                    re: /bazinga/gmi,
                    file: "bazinga.mp3",
                    duration: 550
                },
                {
                    re: /oof/gmi,
                    file: "oof.mp3",
                    duration: 250
                },
                {
                    toggle: 1,
                    re: /bruh/gmi,
                    file: "bruh.mp3",
                    duration: 470
                },
                //{re: /🗿/gmi, file: "moyai.mp3", duration: 100},
                {
                    re: /chicken/gmi,
                    file: "chicken.mp3",
                    duration: 100
                },
                {
                    re: /9001/gmi,
                    file: "9001.mp3",
                    duration: 100
                },
                {
                    re: /gay/gmi,
                    file: "gay.mp3",
                    duration: 100
                },
                {
                    re: /lol/gmi,
                    file: "lol.mp3",
                    duration: 100
                },
                {
                    re: /ok/gmi,
                    file: "ok.mp3",
                    duration: 100
                },
                {
                    re: /omg/gmi,
                    file: "omg.mp3",
                    duration: 100
                },
                {
                    re: /toasty/gmi,
                    file: "toasty.mp3",
                    duration: 100
                },
                {
                    re: /free/gmi,
                    file: "free.mp3",
                    duration: 100
                },
                {
                    re: /xD/gmi,
                    file: "xD.mp3",
                    duration: 100
                }
                ];

                /* Double message event fix */
                let lastMessageID = null;

                /* Meme Sounds Class */
                return class MemeSounds extends Plugin {
                    constructor() {
                        super();
                    }

                    getSettingsPanel() {
                        return this.buildSettingsPanel().getElement();
                    }

                    onStart() {
                        Dispatcher.subscribe("MESSAGE_CREATE", this.messageEvent);
                    }

                    messageEvent = async ({
                        channelId,
                        message,
                        optimistic
                    }) => {
                        if (this.settings.setting.LimitChan && channelId != SelectedChannelStore.getChannelId())
                            return;

                        if (!optimistic && lastMessageID != message.id) {
                            lastMessageID = message.id;
                            let queue = new Map();
                            for (let sound of sounds) {
                                for (let match of message.content.matchAll(sound.re))
                                    queue.set(match.index, sound);
                            }
                            for (let sound of [...queue.entries()].sort((a, b) => a[0] - b[0])) {
                                let audio = new Audio("https://github.com/Lonk12/BetterDiscordPlugins/raw/main/MemeSounds/Sounds/" + sound[1].file);
                                audio.volume = this.settings.setting.volume;
                                audio.play();
                                let audio2 = new Audio("https://raw.githubusercontent.com/AtomicGaming666/BetterDiscord/main/Plugins/MemeSounds/Sounds/" + sound[1].file);
                                audio2.volume = this.settings.setting.volume;
                                audio2.play();
                                await new Promise(r => setTimeout(r, sound[1].duration + this.settings.setting.delay));
                            }
                        }

                    };

                    onStop() {
                        Dispatcher.unsubscribe("MESSAGE_CREATE", this.messageEvent);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();