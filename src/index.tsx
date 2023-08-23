import { render } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import './style.css';
import { ClipLoader } from 'react-spinners';
import { FixedSizeList } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { FileUpload } from './fileUpload';
import { Activity, ClientTextProcesser, TransitionType, TransitionEvent, TradeEvent, TradeState } from './clientTextProcessing';
import { Header } from './header';
import { SessionStats } from './sessionStats';
import { TradeStats } from './tradeStats';

export function App() {
    const [activities, setActivites] = useState<Activity[]>([]);
    const [transitionEvents, setTransitionEvents] = useState<TransitionEvent[]>([]);
    const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [activityTypefilter, setActivityTypeFilter] = useState<TransitionType[]>(getEnumValues(TransitionType));
    const [sessionFilter, setSessionFilter] = useState<Date[] | null>([]);

    const filteredTransitionEvents = useMemo(() => {
        return transitionEvents.filter(transitionEvent => sessionFilter.length > 0 ? sessionFilter.includes(transitionEvent.sessionStartTime) : true);
    }, [transitionEvents, sessionFilter]);

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => activityTypefilter.includes(activity.transitionType) && (sessionFilter.length > 0 ? sessionFilter.includes(activity.sessionStartTime) : true));
    }, [activities, activityTypefilter, sessionFilter]);

    const filteredCompletedTrades = useMemo(() => {
        return tradeEvents.filter(trade => trade.tradeState === TradeState.Accepted && (sessionFilter.length > 0 ? sessionFilter.includes(trade.sessionStartTime) : true));
    }, [activities, activityTypefilter, sessionFilter]);

    const filteredOtherTrades = useMemo(() => {
        return tradeEvents.filter(trade => trade.tradeState !== TradeState.Accepted && (sessionFilter.length > 0 ? sessionFilter.includes(trade.sessionStartTime) : true));
    }, [activities, activityTypefilter, sessionFilter]);

    const activitySessionStartTimes = useMemo(() => {
        const activitySessionStartTimesArray = new Array<Date>();

        for (let i = 0; i < activities.length; i++) {
            if (!activitySessionStartTimesArray.includes(activities[i].sessionStartTime)) {
                activitySessionStartTimesArray.push(activities[i].sessionStartTime)
            }
        }

        return activitySessionStartTimesArray.reverse();
    }, [activities]);

    const ActivityRow = ({ index, style }) => (
        <div class={index % 2 ? 'odd' : 'even'} style={style}>
            {filteredActivities[index].name} {filteredActivities[index].level} {convertMsToTime(filteredActivities[index].totalTime)} {filteredActivities[index].seed}
        </div>
    );

    const TradeRow = ({ index, style }) => (
        <div class={index % 2 ? 'odd' : 'even'} style={style}>
            Sold {filteredCompletedTrades[index].itemQuantity} {filteredCompletedTrades[index].itemName} for {filteredCompletedTrades[index].totalAmount} to {filteredCompletedTrades[index].playerName} at {filteredCompletedTrades[index].startTime.toLocaleString()}
        </div>
    );

    const TransitionEventRow = ({ index, style }) => (
        <div class={index % 2 ? 'odd' : 'even'} style={style}>
            {filteredTransitionEvents[index].name}
        </div>
    );

    const SessionRow = ({ index, style }) => (
        <div onClick={() => { handleSessionSelected(activitySessionStartTimes[index]) }}
            class={sessionFilter.includes(activitySessionStartTimes[index]) ? 'selected-row' : (index % 2 ? 'odd' : 'even')}
            style={style}
        >
            {activitySessionStartTimes[index].toLocaleString()}
        </div>
    );

    const handleSessionSelected = (selectedSession: Date) => {
        if (sessionFilter.includes(selectedSession)) {
            setSessionFilter([...sessionFilter].filter(session => session !== selectedSession));
        } else {
            setSessionFilter([...sessionFilter, selectedSession]);
        }
    }

    const hanldeFileTextLoaded = (fileText: string) => {
        const poeEvents = ClientTextProcesser.convertClientTextToTransitionEvents(fileText);
        const activities = ClientTextProcesser.convertTransitionEventsToActivities(poeEvents.transitionEvents);
        setTransitionEvents(poeEvents.transitionEvents);
        setTradeEvents(poeEvents.tradeEvents.reverse());
        setActivites(activities.reverse());

        setSessionFilter([...sessionFilter, activities[activities.length - 1]?.sessionStartTime]);
    }

    const handleFilterUpdated = (transitionType: TransitionType) => {
        if (activityTypefilter.includes(transitionType)) {
            setActivityTypeFilter([...activityTypefilter].filter(activityType => activityType !== transitionType));
        } else {
            setActivityTypeFilter([...activityTypefilter, transitionType]);
        }
    }

    return (
        <>
            <Header />
            <div class="app-container">
                <div>
                    <div class="file-upload-container">
                        <FileUpload hanldeFileTextLoaded={hanldeFileTextLoaded} setLoading={setLoading} />
                    </div>
                    <div>
                        <ClipLoader
                            loading={loading}
                            size={150}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                    {false && <div class="activity-filter-container">
                        {getEnumValues(TransitionType).map(activityType => {
                            return <button key={activityType} onClick={() => handleFilterUpdated(activityType)}>{activityType}</button>;
                        })}
                    </div>}
                </div>
                {activities.length > 0 && <div class="content-container">
                    <div class="range-filter-container">
                        <div>Login Session Start Times</div>
                        <div class="border-container">
                            <div class="row-container">
                                {/* 
                            // @ts-ignore */}
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <FixedSizeList
                                            height={height}
                                            width={width}
                                            itemSize={35}
                                            itemCount={activitySessionStartTimes.length}
                                        >
                                            {SessionRow}
                                        </FixedSizeList>
                                    )}
                                </AutoSizer>
                            </div>
                        </div>
                    </div>
                    {false && <div class="transition-event-container">
                        <div>Raw Events</div>
                        <div class="border-container">
                            <div class="row-container">
                                {/* 
                            // @ts-ignore */}
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <FixedSizeList
                                            height={height}
                                            width={width}
                                            itemSize={35}
                                            itemCount={filteredTransitionEvents.length}
                                        >
                                            {TransitionEventRow}
                                        </FixedSizeList>
                                    )}
                                </AutoSizer>
                            </div>
                        </div>
                    </div>}
                    <div class="right-pane">
                        <div class="activity-container">
                            <div class="activities">
                                <div>Activities</div>
                                <div class="border-container">
                                    <div class="row-container">
                                        {/* 
                                // @ts-ignore */}
                                        <AutoSizer>
                                            {({ height, width }) => (
                                                <FixedSizeList
                                                    height={height}
                                                    width={width}
                                                    itemSize={35}
                                                    itemCount={filteredActivities.length}
                                                >
                                                    {ActivityRow}
                                                </FixedSizeList>
                                            )}
                                        </AutoSizer>
                                    </div>
                                </div>
                            </div>
                            <div class="activity-stats">
                                <div>Stats</div>
                                <SessionStats activities={filteredActivities} />
                            </div>
                        </div>
                        <div class="trade-container">
                            <div class="trades">
                                <div>Trades</div>
                                <div class="border-container">
                                    <div class="row-container">
                                        {/* 
                                // @ts-ignore */}
                                        <AutoSizer>
                                            {({ height, width }) => (
                                                <FixedSizeList
                                                    height={height}
                                                    width={width}
                                                    itemSize={35}
                                                    itemCount={filteredCompletedTrades.length}
                                                >
                                                    {TradeRow}
                                                </FixedSizeList>
                                            )}
                                        </AutoSizer>
                                    </div>
                                </div>
                            </div>
                            <div class="trade-stats">
                                <div>Stats</div>
                                <TradeStats completedTrades={filteredCompletedTrades} otherTrades={filteredOtherTrades} />
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        </>
    );
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function convertMsToTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
        seconds,
    )}`;
}

type EnumObject = { [key: string]: number | string };
type EnumObjectEnum<E extends EnumObject> = E extends { [key: string]: infer ET | string } ? ET : never;

function getEnumValues<E extends EnumObject>(enumObject: E): EnumObjectEnum<E>[] {
    return Object.keys(enumObject)
        .filter(key => Number.isNaN(Number(key)))
        .map(key => enumObject[key] as EnumObjectEnum<E>);
}

render(<App />, document.getElementById('app'));
