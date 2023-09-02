import { v4 as uuidv4 } from 'uuid';

export class ClientTextProcesser {
    static convertClientTextToTransitionEvents = (clientText: string): PoeEvents => {
        const mapKeyword = "MapWorlds";
        const hideoutKeyword = "Hideout";
        const rogueHarbourKeyword = "HeistHub";
        const heistKeyword = "Heist";
        const loginKeyword = "LOG FILE OPENING";
        const tradeKeywords = ["Hi, I would like to buy your", "Hi, I'd like to buy your", "has joined the area.", "Trade accepted."];
        const deathKeyword = "has been slain.";
        
        let currentSessionStartTime = new Date();
        const transitionEvents: Array<TransitionEvent> = new Array();
        const tradeEvents: Array<TradeEvent> = new Array();
        const fileLines = clientText.split('\r\n');

        for (let i = 0; i < fileLines.length; i++) {
            const currentLine = fileLines[i];

            if (currentLine.includes(loginKeyword) || 
               (currentLine.includes("Generating level") && currentLine.includes("area")) ||
               (tradeKeywords.some(keyword => currentLine.includes(keyword))) ||
               (currentLine.includes(deathKeyword))) {
                const unparsedEventDate = `${currentLine.split(" ")[0]} ${currentLine.split(" ")[1]}`;
                const parsedEventDate = new Date(unparsedEventDate);

                if (currentLine.includes(loginKeyword)) {
                    if (i !== 0 ) {
                        const unparsedLogoutEventDate = `${fileLines[i-1].split(" ")[0]} ${fileLines[i-1].split(" ")[1]}`;
                        const parsedLogoutEventDate = new Date(unparsedLogoutEventDate);
                        transitionEvents.push(new TransitionEvent(TransitionType.Logout, parsedLogoutEventDate, currentSessionStartTime, "Logged out"));
                    }

                    currentSessionStartTime = parsedEventDate;
                    transitionEvents.push(new TransitionEvent(TransitionType.Login, parsedEventDate, currentSessionStartTime, "Logged in"));

                    continue;
                } else if (currentLine.includes("Generating level") && currentLine.includes("area")) {
                    const seed = currentLine.substring(currentLine.indexOf("with seed") + 10);
                    var levelStartIndex = currentLine.indexOf("Generating level") + 17;
                    var spaceAfterLevelIndex = currentLine.indexOf(' ', levelStartIndex);
                    var level = currentLine.substring(levelStartIndex, spaceAfterLevelIndex);
                    const nameStartIndex = currentLine.indexOf("area \"") + 6;
                    const quoteAfterNameIndex = currentLine.indexOf("\"", nameStartIndex);
                    const name = currentLine.substring(nameStartIndex, quoteAfterNameIndex);

                    if (currentLine.includes(mapKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Map, parsedEventDate, currentSessionStartTime, name, level, seed));
                    } else if (currentLine.includes(rogueHarbourKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.RogueHarbour, parsedEventDate, currentSessionStartTime, "Rogue Harbour", level, seed));
                    } else if (currentLine.includes(hideoutKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Hideout, parsedEventDate, currentSessionStartTime, name, level, seed));
                    } else if (currentLine.includes(heistKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Heist, parsedEventDate, currentSessionStartTime, "Heist", level, seed));
                    } else {
                        transitionEvents.push(new TransitionEvent(TransitionType.Unknown, parsedEventDate, currentSessionStartTime, name, level, seed));
                    }
                } else if (tradeKeywords.some(keyword => currentLine.includes(keyword))) {
                    if (currentLine.includes("@From")) {
                        const playerNameStartIndex = currentLine.indexOf("@From") + 6;
                        const playerNameEndIndex = currentLine.indexOf(':', playerNameStartIndex);
                        const playerNameParts = currentLine.substring(playerNameStartIndex, playerNameEndIndex).split(' ');
                        const playerName = playerNameParts[playerNameParts.length - 1];

                        if (currentLine.includes("Hi, I would like to buy your")) {
                            const itemStartIndex = currentLine.indexOf("Hi, I would like to buy your") + 29;

                            let itemEndIndexOffset = 11;
                            let itemEndIndex = currentLine.indexOf("listed for");

                            // some bots or external programs use "for my", allow for that but if it's still borked skip the trade
                            if (itemEndIndex === -1) {
                                itemEndIndex = currentLine.indexOf("for my");
                                itemEndIndexOffset = 7;

                                if (itemEndIndex === -1) {
                                    continue;
                                }
                            }

                            const itemName = currentLine.substring(itemStartIndex, itemEndIndex);

                            const priceStartIndex = itemEndIndex + itemEndIndexOffset;
                            const priceEndIndex = currentLine.indexOf(" in ");
                            const price = currentLine.substring(priceStartIndex, priceEndIndex);

                            tradeEvents.push(new TradeEvent(TradeState.Initiated, parsedEventDate, parsedEventDate, currentSessionStartTime, playerName, itemName, "1", price));
                        } else if (currentLine.includes("Hi, I'd like to buy your")) {
                            const itemQuantityStartIndex = currentLine.indexOf("Hi, I'd like to buy your") + 25;
                            const itemQuantityEndIndex = currentLine.indexOf(' ', itemQuantityStartIndex);
                            const itemQuantity = currentLine.substring(itemQuantityStartIndex, itemQuantityEndIndex);

                            const itemNameEndIndex = currentLine.indexOf("for my");
                            const itemName = currentLine.substring(itemQuantityEndIndex + 1, itemNameEndIndex);

                            const priceStartIndex = itemNameEndIndex + 7;
                            const priceEndIndex = currentLine.indexOf(" in ");
                            const price = currentLine.substring(priceStartIndex, priceEndIndex);

                            tradeEvents.push(new TradeEvent(TradeState.Initiated, parsedEventDate, parsedEventDate, currentSessionStartTime, playerName, itemName, itemQuantity, price));
                        }
                    } else if (currentLine.includes("has joined the area.")) {
                        const currentLineSplit = currentLine.split(' ');
                        const playerName = currentLineSplit[currentLineSplit.length - 5];

                        if (tradeEvents.length === 0) {
                            continue;
                        }

                        let tradeEventIndex = tradeEvents.length - 1;
                        let timeDifference = (parsedEventDate.getTime() - tradeEvents[tradeEventIndex].startTime.getTime()) / 60000;

                        while (timeDifference < 5 && tradeEventIndex > 0) {
                            if (tradeEvents[tradeEventIndex].tradeState === TradeState.Initiated && tradeEvents[tradeEventIndex].playerName === playerName) {
                                tradeEvents[tradeEventIndex].tradeState = TradeState.EnteredHideout;
                                break;
                            }

                            tradeEventIndex--;
                            timeDifference = (parsedEventDate.getTime() - tradeEvents[tradeEventIndex].startTime.getTime()) / 60000;
                        }
                    } else if (currentLine.includes("Trade accepted.")) {
                        if (tradeEvents.length === 0) {
                            continue;
                        }

                        let tradeEventIndex = tradeEvents.length - 1;
                        let timeDifference = (parsedEventDate.getTime() - tradeEvents[tradeEventIndex].startTime.getTime()) / 60000;

                        while (timeDifference < 5 && tradeEventIndex > 0) {
                            if (tradeEvents[tradeEventIndex].tradeState === TradeState.EnteredHideout) {
                                tradeEvents[tradeEventIndex].tradeState = TradeState.Accepted;
                                break;
                            }

                            tradeEventIndex--;
                            timeDifference = (parsedEventDate.getTime() - tradeEvents[tradeEventIndex].startTime.getTime()) / 60000;
                        }
                    }
                } else if (currentLine.includes(deathKeyword)) {
                    
                }
            }
        }

        return {transitionEvents, tradeEvents};
    }

    static convertTransitionEventsToActivities = (transitionEvents: Array<TransitionEvent>): Array<Activity> =>{
        const activities: Map<string, Activity> = new Map<string, Activity>();

        for (let i = 0; i < transitionEvents.length; i++) {
            const currentTransitionEvent = transitionEvents[i];
            let totalActivityTime = 0;

            if (currentTransitionEvent.transitionType === TransitionType.Login || currentTransitionEvent.transitionType === TransitionType.Logout) {
                continue;
            }

            if (i + 1 < transitionEvents.length) {
                if (transitionEvents[i + 1].transitionType != TransitionType.Login) {
                    totalActivityTime = transitionEvents[i + 1].enterTime.getTime() - currentTransitionEvent.enterTime.getTime()
                }
            }

            if (currentTransitionEvent.transitionType === TransitionType.Map || currentTransitionEvent.transitionType === TransitionType.Heist) {
                if (activities.has(currentTransitionEvent.seed)) {
                    activities.get(currentTransitionEvent.seed).totalTime += totalActivityTime;
                    continue;
                } else {
                    activities.set(
                        currentTransitionEvent.seed,
                        new Activity(
                            currentTransitionEvent.transitionType, 
                            currentTransitionEvent.enterTime, 
                            totalActivityTime,
                            currentTransitionEvent.sessionStartTime,
                            currentTransitionEvent.name, 
                            currentTransitionEvent.level, 
                            currentTransitionEvent.seed)
                    );
                }
            }
        }

        return Array.from(activities.values());
    }
}

export class Activity {
    public transitionType: TransitionType;
    public enterTime: Date;
    public totalTime: number;
    public sessionStartTime: Date;
    public name?: string;
    public level?: string;
    public seed?: string;

    public constructor(transitionType: TransitionType, enterTime: Date, totalTime: number, sessionStartTime: Date, name?: string, level?: string, seed?: string) {
        this.transitionType = transitionType;
        this.enterTime = enterTime;
        this.totalTime = totalTime;
        this.sessionStartTime = sessionStartTime;
        this.name = name;
        this.level = level;        
        this.seed = seed;
    }
}

export class TransitionEvent {
    public transitionType: TransitionType;
    public enterTime: Date;
    public sessionStartTime: Date;
    public name?: string;
    public level?: string;
    public seed?: string;

    public constructor(transitionType: TransitionType, enterTime: Date, sessionStartTime: Date, name?: string, level?: string, seed?: string) {
        this.transitionType = transitionType;
        this.enterTime = enterTime;
        this.sessionStartTime = sessionStartTime;
        this.name = name;
        this.level = level;
        this.seed = seed;
    }
}

export enum TransitionType {
    Hideout = "Hideout",
    Map = "Map",
    RogueHarbour = "Rogue Harbour",
    Heist = "Heist",
    Login = "Login",
    Logout = "Logout",
    Unknown = "Unknown"
}

export class TradeEvent {
    public tradeState: TradeState;
    public startTime: Date;
    public endTime: Date;
    public sessionStartTime: Date;
    public playerName: string;
    public itemName: string;
    public itemQuantity: string;
    public totalAmount: string;

    public constructor(tradeState: TradeState, startTime: Date, endTime: Date, sessionStartTime: Date, playerName: string, itemName: string, itemQuantity: string, totalAmount: string) {
        this.tradeState = tradeState;
        this.startTime = startTime;        
        this.endTime = endTime;
        this.sessionStartTime = sessionStartTime;
        this.playerName = playerName;
        this.itemName = itemName;
        this.itemQuantity = itemQuantity;
        this.totalAmount = totalAmount;
    }
}

export interface PoeEvents {
    transitionEvents: Array<TransitionEvent>;
    tradeEvents: Array<TradeEvent>;
}

export enum TradeState {
    Initiated,
    EnteredHideout,
    Accepted
}