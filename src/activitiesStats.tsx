import { useMemo } from 'preact/hooks';
import './styles/style.css';
import { Activity, TransitionType } from './clientTextProcessing';

interface ActivitiesStatsProps {
    activities: Activity[]
}

export function ActivitiesStats(props: ActivitiesStatsProps) {
    const mapCount = useMemo(() => {
        return props.activities.filter(activity => activity.transitionType === TransitionType.Map).length;
    }, [props.activities]);

    const heistsCount = useMemo(() => {
        return props.activities.filter(activity => activity.transitionType === TransitionType.Heist).length;
    }, [props.activities]);

    return (
        <div>
            <p>Maps: {mapCount ?? 0}</p>
            <p>Heists: {heistsCount ?? 0}</p>
        </div>
    )
}