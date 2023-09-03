import './styles/style.css';

interface NavigationProps {
    activeNavigationPage: NavigationPage
    setActiveNavigationPage: (page: NavigationPage) => void;
}

export const Navigation = (props: NavigationProps) => {
    return (
        <div class="navigation-container">
            <div 
                class={"navigation-button " + (props.activeNavigationPage === NavigationPage.Activities ? "selected" : "")} 
                onClick={() => props.setActiveNavigationPage(NavigationPage.Activities)}
            >
                Activities
            </div>
            <div 
                class={"navigation-button "  + (props.activeNavigationPage === NavigationPage.Trades ? "selected" : "")} 
                onClick={() => props.setActiveNavigationPage(NavigationPage.Trades)}
            >
                Trades
            </div>
            <div 
                class={"navigation-button "  + (props.activeNavigationPage === NavigationPage.Notes ? "selected" : "")} 
                onClick={() => props.setActiveNavigationPage(NavigationPage.Notes)}
            >
                Notes
            </div>
            <div 
                class={"navigation-button "  + (props.activeNavigationPage === NavigationPage.RawEvents ? "selected" : "")} 
                onClick={() => props.setActiveNavigationPage(NavigationPage.RawEvents)}
            >
                Raw Events
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