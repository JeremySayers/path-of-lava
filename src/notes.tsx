import { useMemo, useState } from 'preact/hooks';
import './styles/style.css';
import { Note } from './clientTextProcessing';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DateRange } from './dateFilter';

interface NotesProps {
    notes: Note[];
    dateRangeFilter: DateRange | null;
}

export function Notes(props: NotesProps) {
    const [selectedPlayerName, setSelectedPlayerName] = useState<string>("");
    const dateFilteredNotes = useMemo(() => {
        // if a range was set then we'll have an array of dates [from, to]. If neither are null, filter on that.
        if (props.dateRangeFilter && "length" in props.dateRangeFilter && props.dateRangeFilter[0] !== null && props.dateRangeFilter[1] !== null) {
            return props.notes.filter(note => {
                return note.createdTime > props.dateRangeFilter[0] && note.createdTime < props.dateRangeFilter[1];
            })      
        // if we don't have any filters then we want to return every note.
        } else {
            return props.notes;
        }
    }, [props.notes, props.dateRangeFilter]);

    const playerNames = useMemo(() => {
        const playerNameLookup = [];

        dateFilteredNotes.forEach(note => {
            if (!playerNameLookup.includes(note.playerName)) {
                playerNameLookup.push(note.playerName);
            }
        })

        if (playerNameLookup.length > 0) {
            setSelectedPlayerName(playerNameLookup[0]);
        }

        return playerNameLookup;
    }, [dateFilteredNotes]);

    const playerFilteredNotes = useMemo(() => {
        return dateFilteredNotes.filter(note => {
            return note.playerName === selectedPlayerName;
        });
    }, [dateFilteredNotes, selectedPlayerName]);

    const NoteRow = ({ index, style }) => (
        <div class={index % 2 ? 'odd' : 'even'} style={style}>
            {playerFilteredNotes[index].playerName}: {playerFilteredNotes[index].text} {playerFilteredNotes[index].createdTime.toLocaleString()}
        </div>
    );

    return (
        <div class="notes-container">
            <div class="notes-player-selector">
                <select class="notes-player-selector-dropdown" onChange={(e: any) => setSelectedPlayerName(e.target.value)}>
                {playerNames.map(playerName => {
                    return <option key={playerName} selected={playerName===selectedPlayerName}>{playerName}</option>
                })}
                </select>
            </div>
            
            <div class="notes">
                <div>Notes</div>
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
                                    itemCount={playerFilteredNotes.length}
                                >
                                    {NoteRow}
                                </FixedSizeList>
                            )}
                        </AutoSizer>
                    </div>
                </div>
            </div>
        </div>
    )
}