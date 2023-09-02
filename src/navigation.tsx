import './styles/style.css';

interface NavigationProps {
    activeNavigationPage: NavigationPage
    setActiveNavigationPage: (page: NavigationPage) => void;
}

export const Navigation = (props: NavigationProps) => {
    return (
        <div class="navigation-container">
            <div class="navigation-button" onClick={() => props.setActiveNavigationPage(NavigationPage.Activities)}>
                Activities
            </div>
            <div class="navigation-button" onClick={() => props.setActiveNavigationPage(NavigationPage.Trades)}>
                Trades
            </div>
            <div class="navigation-button" onClick={() => props.setActiveNavigationPage(NavigationPage.Notes)}>
                Notes
            </div>
        </div>
    );
}

export enum NavigationPage {
    Activities,
    Trades,
    Notes,
    RawEvents
}