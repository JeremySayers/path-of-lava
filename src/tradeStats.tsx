import { useMemo } from 'preact/hooks';
import './style.css';
import { TradeEvent, TradeState } from './clientTextProcessing';

interface TradeStatsProps {
    trades: TradeEvent[]
}

interface TotalSales {
    chaos: number;
    divine: number;
}

export function TradeStats(props: TradeStatsProps) {
    const completedTrades = useMemo(() => {
        return props.trades.filter(trade => trade.tradeState === TradeState.Accepted).length;
    }, [props.trades]);

    const unnfinishedTrades = useMemo(() => {
        return props.trades.filter(trade => trade.tradeState !== TradeState.Accepted).length;
    }, [props.trades]);

    const totalSalesFromTrades = useMemo<TotalSales>(() => {
        let chaos = 0;
        let divine = 0;

        for (let i = 0; i < props.trades.length; i++) {
            if (props.trades[i].totalAmount.toLowerCase().includes("chaos")) {
                const splitPriceLine = props.trades[i].totalAmount.split(' ');
                chaos += Number(splitPriceLine[0]);
            } else if (props.trades[i].totalAmount.toLowerCase().includes("divine")) {
                const splitPriceLine = props.trades[i].totalAmount.split(' ');
                divine += Number(splitPriceLine[0]);
            }
        }

        return { chaos, divine }
    }, [props.trades]);

    return (
        <div>
            <p>Completed Sales: {completedTrades ?? 0}</p>
            <p>Unnfinished Sales: {unnfinishedTrades ?? 0}</p>
            <p>Total Chaos from Sales: {totalSalesFromTrades.chaos ?? 0}</p>
            <p>Total Divine from Sales: {totalSalesFromTrades.divine ?? 0}</p>
        </div>
    )
}