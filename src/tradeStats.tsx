import { useMemo } from 'preact/hooks';
import './style.css';
import { TradeEvent, TradeState } from './clientTextProcessing';

interface TradeStatsProps {
    completedTrades: TradeEvent[]
    otherTrades: TradeEvent[];
}

interface TotalSales {
    chaos: number;
    divine: number;
}

export function TradeStats(props: TradeStatsProps) {
    const completedTrades = useMemo(() => {
        return props.completedTrades.filter(trade => trade.tradeState === TradeState.Accepted).length;
    }, [props.completedTrades]);

    const unfinishedTrades = useMemo(() => {
        return props.otherTrades.filter(trade => trade.tradeState != TradeState.Accepted).length;
    }, [props.otherTrades]);

    const totalSalesFromTrades = useMemo<TotalSales>(() => {
        let chaos = 0;
        let divine = 0;

        for (let i = 0; i < props.completedTrades.length; i++) {
            if (props.completedTrades[i].totalAmount.toLowerCase().includes("chaos")) {
                const splitPriceLine = props.completedTrades[i].totalAmount.split(' ');
                chaos += Number(splitPriceLine[0]);
            } else if (props.completedTrades[i].totalAmount.toLowerCase().includes("divine")) {
                const splitPriceLine = props.completedTrades[i].totalAmount.split(' ');
                divine += Number(splitPriceLine[0]);
            }
        }

        return { chaos, divine }
    }, [props.completedTrades]);

    return (
        <div>
            <p>Completed Sales: {completedTrades ?? 0}</p>
            <p>Unfinished Sales: {unfinishedTrades ?? 0}</p>
            <p>Total Chaos from Sales: {totalSalesFromTrades.chaos ?? 0}</p>
            <p>Total Divine from Sales: {totalSalesFromTrades.divine ?? 0}</p>
        </div>
    )
}