import { render } from 'preact';
import { useState } from 'preact/hooks';
import './styles/style.css';
import { ClipLoader } from 'react-spinners';
import { FileUpload } from './fileUpload';
import { Activity, ClientTextProcesser, TransitionEvent, TradeEvent } from './clientTextProcessing';
import { Header } from './header';
import { Activities } from './activites';
import { DateFilter, DateRange } from './dateFilter';
import { Navigation, NavigationPage } from './navigation';
import { Transitions } from './transitions';
import { Trades } from './trades';

export function App() {
    const [activities, setActivites] = useState<Activity[]>([]);
    const [transitionEvents, setTransitionEvents] = useState<TransitionEvent[]>([]);
    const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeNavigationPage, setActiveNavigationPage] = useState<NavigationPage>(NavigationPage.Activities);
    const [dateRangeFilter, setDateRangeFilter] = useState<DateRange>([new Date(new Date().setHours(0, 0, 0, 0)), new Date(new Date().setHours(23, 59, 59, 999))]);

    const hanldeFileTextLoaded = (fileText: string) => {
        const poeEvents = ClientTextProcesser.convertClientTextToTransitionEvents(fileText);
        const activities = ClientTextProcesser.convertTransitionEventsToActivities(poeEvents.transitionEvents);
        setTransitionEvents(poeEvents.transitionEvents);
        setTradeEvents(poeEvents.tradeEvents.reverse());
        setActivites(activities.reverse());
    }

    const handleDateFilterUpdated = (dateRange: DateRange) => {
        setDateRangeFilter(dateRange);
    }

    return (
        <>
            <Header />
            <div class="app-container">
                <div class="omni-bar-container">
                    <div class="file-upload-container">
                        <FileUpload hanldeFileTextLoaded={hanldeFileTextLoaded} setLoading={setLoading} />
                    </div>
                    {activities.length > 0 && <>
                        <div class="date-filter-container">
                            <DateFilter value={dateRangeFilter} setValue={handleDateFilterUpdated} />
                        </div>
                    </>}
                </div>
                <div>
                    <ClipLoader
                        loading={loading}
                        size={150}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
                {activities.length > 0 && 
                    <Navigation setActiveNavigationPage={setActiveNavigationPage} activeNavigationPage={activeNavigationPage}/> 
                }
                {activities.length > 0 && <div class="content-container">
                    {activeNavigationPage === NavigationPage.RawEvents && 
                        <Transitions transitions={transitionEvents} dateRangeFilter={dateRangeFilter} />
                    }
                    {activeNavigationPage === NavigationPage.Activities &&
                        <Activities activities={activities} dateRangeFilter={dateRangeFilter} />
                    }
                    {activeNavigationPage === NavigationPage.Trades &&
                        <Trades tradeEvents={tradeEvents} dateRangeFilter={dateRangeFilter}/>
                    }
                </div>}
            </div>
        </>
    );
}

render(<App />, document.getElementById('app'));
