import { useMemo } from 'preact/hooks';
import './styles/style.css';
import { Activity, TransitionType } from './clientTextProcessing';
import { convertMsToTime } from './utilities';

interface ActivitiesStatsProps {
    activeActivities: Activity[];
    downTimeActivities: Activity[];
}

export function ActivitiesStats(props: ActivitiesStatsProps) {
    const mapCount = useMemo(() => {
        return props.activeActivities.filter(activity => activity.transitionType === TransitionType.Map).length;
    }, [props.activeActivities]);

    const heistsCount = useMemo(() => {
        return props.activeActivities.filter(activity => activity.transitionType === TransitionType.Heist).length;
    }, [props.activeActivities]);

    const hideoutDowntime = useMemo(() => {
        let totalHideoutTime = 0;

        props.downTimeActivities.forEach(activity => {
            if (activity.transitionType === TransitionType.Hideout) {
                totalHideoutTime += activity.totalTime;
            }
        });

        return totalHideoutTime;
    }, [props.downTimeActivities]);

    const rogueHarbourDownTime = useMemo(() => {
        let totalRogueHarbourDowntime = 0;

        props.downTimeActivities.forEach(activity => {
            if (activity.transitionType === TransitionType.RogueHarbour) {
                totalRogueHarbourDowntime += activity.totalTime;
            }
        });

        return totalRogueHarbourDowntime;
    }, [props.downTimeActivities]);

    const mapActiveTime = useMemo(() => {
        let totalMapActiveTime = 0;

        props.activeActivities.forEach(activity => {
            if (activity.transitionType === TransitionType.Map) {
                totalMapActiveTime += activity.totalTime;
            }
        });

        return totalMapActiveTime;
    }, [props.activeActivities]);

    const heistActiveTime = useMemo(() => {
        let totalHeistActiveTime = 0;

        props.activeActivities.forEach(activity => {
            if (activity.transitionType === TransitionType.Heist) {
                totalHeistActiveTime += activity.totalTime;
            }
        });

        return totalHeistActiveTime;
    }, [props.activeActivities]);

    return (
        <div>
            {mapCount > 0 &&<p>Maps: {mapCount}</p>}
            {heistsCount > 0 && <p>Heists: {heistsCount}</p>}
            {mapCount > 0 && <p>Average Map Time: {convertMsToTime(mapActiveTime / mapCount)}</p>}
            {heistsCount > 0 && <p>Average Heist Time: {convertMsToTime(heistActiveTime / heistsCount)}</p>}
            {mapActiveTime > 0 && <p>Time in Maps: {convertMsToTime(mapActiveTime)}</p>}
            {heistActiveTime > 0 &&<p>Time in Heist: {convertMsToTime(heistActiveTime) ?? 0}</p>}
            <p>Time in Hideout: {convertMsToTime(hideoutDowntime) ?? 0}</p>
            <p>Time in Harbour: {convertMsToTime(rogueHarbourDownTime) ?? 0}</p>
            <p>Active Percentage: {(((mapActiveTime + heistActiveTime) / (mapActiveTime + heistActiveTime + hideoutDowntime + rogueHarbourDownTime)) * 100).toFixed(2)}%</p>
        </div>
    )
}