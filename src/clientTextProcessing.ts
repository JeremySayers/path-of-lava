export class ClientTextProcesser {
    static convertClientTextToTransitionEvents = (clientText: string): Array<TransitionEvent> => {
        const mapKeyword = "MapWorlds";
        const hideoutKeyword = "Hideout";
        const rogueHarbourKeyword = "HeistHub";
        const heistKeyword = "Heist";
        const loginKeyword = "LOG FILE OPENING";    
        const generatingKeywords = [mapKeyword, hideoutKeyword, rogueHarbourKeyword, heistKeyword];
        
        const transitionEvents: Array<TransitionEvent> = new Array();
        const fileLines = clientText.split('\r\n');

        for (let i = 0; i < fileLines.length; i++) {
            const currentLine = fileLines[i];

            if (currentLine.includes(loginKeyword) || (generatingKeywords.some(keyword => currentLine.includes(keyword)) && currentLine.includes("Generating"))) {
                const unparsedEventDate = `${currentLine.split(" ")[0]} ${currentLine.split(" ")[1]}`;
                const parsedEventDate = new Date(unparsedEventDate);

                if (currentLine.includes(loginKeyword)) {
                    if (i !== 0 ) {
                        const unparsedLogoutEventDate = `${fileLines[i-1].split(" ")[0]} ${fileLines[i-1].split(" ")[1]}`;
                        const parsedLogoutEventDate = new Date(unparsedLogoutEventDate);
                        transitionEvents.push(new TransitionEvent(TransitionType.Logout, parsedLogoutEventDate));
                    }

                    transitionEvents.push(new TransitionEvent(TransitionType.Login, parsedEventDate));

                    continue;
                } else {
                    const seed = currentLine.substring(currentLine.indexOf("with seed") + 10);
                    var levelStartIndex = currentLine.indexOf("Generating level") + 17;
                    var spaceAfterLevelIndex = currentLine.indexOf(' ', levelStartIndex);
                    var level = currentLine.substring(levelStartIndex, spaceAfterLevelIndex);

                    if (currentLine.includes(mapKeyword)) {
                        const nameStartIndex = currentLine.indexOf("MapWorlds") + 9;
                        const quoteAfterNameIndex = currentLine.indexOf("\"", nameStartIndex);
                        const name = currentLine.substring(nameStartIndex, quoteAfterNameIndex);
                        
                        transitionEvents.push(new TransitionEvent(TransitionType.Map, parsedEventDate, name, level, seed));
                    } else if (currentLine.includes(heistKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Heist, parsedEventDate, "Heist", level, seed));
                    } else if (currentLine.includes(hideoutKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Hideout, parsedEventDate, "Hideout", level, seed));
                    } else if (currentLine.includes(rogueHarbourKeyword)) {
                        transitionEvents.push(new TransitionEvent(TransitionType.Hideout, parsedEventDate, "Rogue Harbour", level, seed));
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
    public name?: string;
    public level?: string;

    public constructor(transitionType: TransitionType, enterTime: Date, totalTime: number, name?: string, level?: string, seed?: string) {
        this.transitionType = transitionType;
        this.enterTime = enterTime;
        this.totalTime = totalTime;
        this.name = name;
        this.level = level;
    }
}

export class TransitionEvent {
    public transitionType: TransitionType;
    public enterTime: Date;
    public name?: string;
    public level?: string;
    public seed?: string;

    public constructor(transitionType: TransitionType, enterTime: Date, name?: string, level?: string, seed?: string) {
        this.transitionType = transitionType;
        this.enterTime = enterTime;
        this.name = name;
        this.level = level;
        this.seed = seed;
    }
}

export enum TransitionType {
    Hideout,
    Map,
    RogueHarbour,
    Heist,
    Login,
    Logout
}