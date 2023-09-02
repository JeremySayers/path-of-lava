import { useMemo } from 'preact/hooks';
import './styles/style.css';
import { TransitionEvent } from './clientTextProcessing';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DateRange } from './dateFilter';

interface TransitionProps {
    transitions: TransitionEvent[];
    dateRangeFilter: DateRange | null;
}

export function Transitions(props: TransitionProps) {
    const filteredTransitionEvents = useMemo(() => {
        // if a range was set then we'll have an array of dates [from, to]. If neither are null, filter on that.
        if (props.dateRangeFilter && "length" in props.dateRangeFilter && props.dateRangeFilter[0] !== null && props.dateRangeFilter[1] !== null) {
            return props.transitions.filter(transitionEvent => {
                return transitionEvent.enterTime > props.dateRangeFilter[0] && transitionEvent.enterTime < props.dateRangeFilter[1];
            })      
        // if we don't have any filters then we want to return every activity.
        } else {
            return props.transitions;
        }
    }, [props.transitions, props.dateRangeFilter]);

    const TransitionEventRow = ({ index, style }) => (
        <div class={index % 2 ? 'odd' : 'even'} style={style}>
            {filteredTransitionEvents[index].name}
        </div>
    );

    return (
        <div class="transition-event-container">
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
        </div>
    )
}