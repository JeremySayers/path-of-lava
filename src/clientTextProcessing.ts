import { v4 as uuidv4 } from 'uuid';

export class ClientTextProcesser {
    static convertClientTextToTransitionEvents = (clientText: string): Array<TransitionEvent> => {
        const mapKeyword = "MapWorlds";
        const hideoutKeyword = "Hideout";
        const rogueHarbourKeyword = "HeistHub";
        const heistKeyword = "Heist";
        const loginKeyword = "LOG FILE OPENING";    
        const generatingKeywords = [mapKeyword, hideoutKeyword, rogueHarbourKeyword, heistKeyword];
        
        let currentSessionStartTime = new Date();
        const transitionEvents: Array<TransitionEvent> = new Array();
        const fileLines = clientText.split('\r\n');

        for (let i = 0; i < fileLines.length; i++) {
            const currentLine = fileLines[i];

            if (currentLine.includes(loginKeyword) || (currentLine.includes("Generating level") && currentLine.includes("area"))) {
                const unparsedEventDate = `${currentLine.split(" ")[0]} ${currentLine.split(" ")[1]}`;
                const parsedEventDate = new Date(unparsedEventDate);

                if (currentLine.includes(loginKeyword)) {
                    if (i !== 0 ) {
                        const unparsedLogoutEventDate = `${fileLines[i-1].split(" ")[0]} ${fileLines[i-1].split(" ")[1]}`;
                        const parsedLogoutEventDate = new Date(unparsedLogoutEventDate);
                        transitionEvents.push(new TransitionEvent(TransitionType.Logout, parsedLogoutEventDate, currentSessionStartTime));
                    }

                    currentSessionStartTime = parsedEventDate;
                    transitionEvents.push(new TransitionEvent(TransitionType.Login, parsedEventDate, currentSessionStartTime));

                    continue;
                } else {
                    const seed = currentLine.substring(currentLine.indexOf("with seed") + 10);
                    var levelStartIndex = currentLine.indexOf("Generating level") + 17;
                    var spaceAfterLevelIndex = currentLine.indexOf(' ', levelStartIndex);
                    var level = currentLine.substring(levelStartIndex, spaceAfterLevelIndex);
                    const nameStartIndex = currentLine.indexOf("area \"") + 6;
                    const quoteAfterNameIndex = currentLine.indexOf("\"", nameStartIndex);
                    const name = currentLine.substring(nameStartIndex, quoteAfterNameIndex);

                    if (currentLine.includes(mapKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Map, parsedEventDate, currentSessionStartTime, name, level, seed));
                    } else if (currentLine.includes(heistKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Heist, parsedEventDate, currentSessionStartTime, "Heist", level, seed));
                    } else if (currentLine.includes(hideoutKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Hideout, parsedEventDate, currentSessionStartTime, "Hideout", level, seed));
                    } else if (currentLine.includes(rogueHarbourKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Hideout, parsedEventDate, currentSessionStartTime, "Rogue Harbour", level, seed));
                    } else {
                        transitionEvents.push(new TransitionEvent(TransitionType.Unknown, parsedEventDate, currentSessionStartTime, name, level, seed));
                    }
                }
            }
        }

        return transitionEvents;
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

            if (activities.has(currentTransitionEvent.seed)) {
                activities.get(currentTransitionEvent.seed).totalTime += totalActivityTime;
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
                        currentTransitionEvent.seed));
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

    public constructor(transitionType: TransitionType, enterTime: Date, totalTime: number, sessionStartTime: Date, name?: string, level?: string, seed?: string) {
        this.transitionType = transitionType;
        this.enterTime = enterTime;
        this.totalTime = totalTime;
        this.sessionStartTime = sessionStartTime;
        this.name = name;
        this.level = level;
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