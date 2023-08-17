import { render } from 'preact';
import { useState } from 'preact/hooks';
import './style.css';
import { ClipLoader } from 'react-spinners';
import { FixedSizeList } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { FileUpload } from './fileUpload';
import { Activity, ClientTextProcesser, TransitionEvent } from './clientTextProcessing';


export function App() {
    const [activities, setActivites] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);

    const Row = ({ index, style }) => (
        <div style={style}>
            {activities[index].name} {activities[index].level} {convertMsToTime(activities[index].totalTime)}
        </div>
    );

    const hanldeFileTextLoaded = (fileText: string) => {
        const transitionEvents = ClientTextProcesser.convertClientTextToTransitionEvents(fileText);
        const activities = ClientTextProcesser.convertTransitionEventsToActivities(transitionEvents);
        setActivites(activities);
    }

    return (
        <div class="app-container">
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
            <div class="list-container">
                {/* 
                // @ts-ignore */}
                <AutoSizer>
                    {({ height, width }) => (
                        <FixedSizeList
                            height={height}
                            width={width}
                            itemSize={50}
                            itemCount={activities.length}
                        >
                            {Row}
                        </FixedSizeList>
                    )}
                </AutoSizer>
            </div>
        </div>
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

render(<App />, document.getElementById('app'));
