import { useState } from 'preact/hooks';
import './styles/style.css';

interface SearchProps {
    hanldeSearchUpdated: (fileText: string) => void;
}

export function Search(props: SearchProps) {
    const [search, setSearch] = useState("");

    const handleSearchChange = (e) => {
        e.preventDefault();
        setSearch(e.target.value);
    };

    return (
        <div style={{ 'width': '100%' }}>
            <input placeholder="Search by name or level" type="text" onChange={handleSearchChange} value={search} class="search-bar-input" />
        </div>
    )
}