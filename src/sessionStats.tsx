import { useState, useCallback, useMemo } from 'preact/hooks';
import './style.css';
import { useDropzone } from 'react-dropzone'
import { Activity, TransitionType } from './clientTextProcessing';

interface SessionStatsProps {
    activities: Activity[]
}

interface SessionStatsByActivity {
    maps: number;
    heists: number;
}

export function SessionStats(props: SessionStatsProps) {
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