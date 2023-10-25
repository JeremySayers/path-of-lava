import { useMemo } from 'preact/hooks';
import './styles/style.css';
import { Activity, TransitionType } from './clientTextProcessing';
import { FixedSizeList } from 'react-window';
import { convertMsToTime } from './utilities';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ActivitiesStats } from './activitiesStats';
import { DateRange } from './dateFilter';

interface ActivitiesProps {
    activities: Activity[];
    dateRangeFilter: DateRange | null;
}

export function Activities(props: ActivitiesProps) {
    const filteredActiveActivities = useMemo(() => {
        const activeActivities = props.activities.filter(activity => {
            return activity.transitionType === TransitionType.Map || activity.transitionType === TransitionType.Heist || TransitionType.FirstFloorSanctumRoom || TransitionType.SecondFloorSanctumRoom || TransitionType.ThirdFloorSanctumRoom || TransitionType.FourthFloorSanctumRoom;
        })

        // if a range was set then we'll have an array of dates [from, to]. If neither are null, filter on that.
        if (props.dateRangeFilter && "length" in props.dateRangeFilter && props.dateRangeFilter[0] !== null && props.dateRangeFilter[1] !== null) {
            return activeActivities.filter(activity => {
                return activity.enterTime > props.dateRangeFilter[0] && activity.enterTime < props.dateRangeFilter[1];
            })
            // if we don't have any filters then we want to return every activity.
        } else {
            return activeActivities;
        }
    }, [props.activities, props.dateRangeFilter]);

    const filteredDownTimeActivities = useMemo(() => {
        const downTimeActivities = props.activities.filter(activity => {
            return activity.transitionType === TransitionType.Hideout || activity.transitionType === TransitionType.RogueHarbour
        })

        // if a range was set then we'll have an array of dates [from, to]. If neither are null, filter on that.
        if (props.dateRangeFilter && "length" in props.dateRangeFilter && props.dateRangeFilter[0] !== null && props.dateRangeFilter[1] !== null) {
            return downTimeActivities.filter(activity => {
                return activity.enterTime > props.dateRangeFilter[0] && activity.enterTime < props.dateRangeFilter[1];
            })
            // if we don't have any filters then we want to return every activity.
        } else {
            return downTimeActivities;
        }
    }, [props.activities, props.dateRangeFilter]);


    const ActivityRow = ({ index, style }) => (
        <div class={index % 2 ? 'odd' : 'even'} style={style}>
            {filteredActiveActivities[index].name} {filteredActiveActivities[index].level} {convertMsToTime(filteredActiveActivities[index].totalTime)} {filteredActiveActivities[index].seed}
        </div>
    );

    return (
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
                                    itemCount={filteredActiveActivities.length}
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
                <ActivitiesStats activeActivities={filteredActiveActivities} downTimeActivities={filteredDownTimeActivities} />
            </div>
        </div>
    )
}