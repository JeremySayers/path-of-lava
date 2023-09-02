import { useMemo } from 'preact/hooks';
import './styles/style.css';
import { TradeEvent, TradeState } from './clientTextProcessing';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DateRange } from './dateFilter';
import { TradeStats } from './tradeStats';

interface TradesProps {
    tradeEvents: TradeEvent[];
    dateRangeFilter: DateRange | null;
}

export function Trades(props: TradesProps) {
    const filteredCompletedTrades = useMemo(() => {
        // if a range was set then we'll have an array of dates [from, to]. If neither are null, filter on that.
        if (props.dateRangeFilter && "length" in props.dateRangeFilter && props.dateRangeFilter[0] !== null && props.dateRangeFilter[1] !== null) {
            return props.tradeEvents.filter(trade => {
                return trade.startTime > props.dateRangeFilter[0] && 
                    trade.startTime < props.dateRangeFilter[1] && 
                    trade.tradeState === TradeState.Accepted
            })   
        // if we don't have any filters then we want to return every activity.
        } else {
            return props.tradeEvents;
        }
    }, [props.tradeEvents, props.dateRangeFilter]);

    const filteredOtherTrades = useMemo(() => {
        // if a range was set then we'll have an array of dates [from, to]. If neither are null, filter on that.
        if (props.dateRangeFilter && "length" in props.dateRangeFilter && props.dateRangeFilter[0] !== null && props.dateRangeFilter[1] !== null) {
            return props.tradeEvents.filter(trade => {
                return trade.startTime > props.dateRangeFilter[0] && 
                    trade.startTime < props.dateRangeFilter[1] && 
                    trade.tradeState !== TradeState.Accepted
            })   
        // if we don't have any filters then we want to return every activity.
        } else {
            return props.tradeEvents;
        }
    }, [props.tradeEvents, props.dateRangeFilter]);

    const TradeRow = ({ index, style }) => (
        <div class={index % 2 ? 'odd' : 'even'} style={style}>
            Sold {filteredCompletedTrades[index].itemQuantity} {filteredCompletedTrades[index].itemName} for {filteredCompletedTrades[index].totalAmount} to {filteredCompletedTrades[index].playerName} at {filteredCompletedTrades[index].startTime.toLocaleString()}
        </div>
    );

    return (
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

    )
}