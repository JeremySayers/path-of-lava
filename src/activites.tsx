import { useMemo } from 'preact/hooks';
import './styles/style.css';
import { Activity } from './clientTextProcessing';
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
    const filteredActivities = useMemo(() => {
        // if a range was set then we'll have an array of dates [from, to]. If neither are null, filter on that.
        if (props.dateRangeFilter && "length" in props.dateRangeFilter && props.dateRangeFilter[0] !== null && props.dateRangeFilter[1] !== null) {
            return props.activities.filter(activity => {
                return activity.enterTime > props.dateRangeFilter[0] && activity.enterTime < props.dateRangeFilter[1];
            })      
        // if we don't have any filters then we want to return every activity.
        } else {
            return props.activities;
        }
    }, [props.activities, props.dateRangeFilter]);

    const ActivityRow = ({ index, style }) => (
        <div class={index % 2 ? 'odd' : 'even'} style={style}>
            {filteredActivities[index].name} {filteredActivities[index].level} {convertMsToTime(filteredActivities[index].totalTime)} {filteredActivities[index].seed}
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
                <ActivitiesStats activities={filteredActivities} />
            </div>
        </div>
    )
}