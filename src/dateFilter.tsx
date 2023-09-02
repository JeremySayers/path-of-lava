import { useState } from 'preact/hooks';
import './styles/style.css';
import './styles/dateTimeRangePicker.css';
import './styles/calendar.css';
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';

interface DateFilterProps {
    setValue: DateRange | ((prevState: DateRange) => void)
    value: DateRange;
}

export function DateFilter(props: DateFilterProps) {
    return (
        <DateTimeRangePicker onChange={props.setValue} value={props.value} disableClock={true} />
    );
}

export type DatePiece = Date | null;
export type DateRange = DatePiece | [DatePiece, DatePiece];