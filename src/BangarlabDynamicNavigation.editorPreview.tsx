import { ReactElement, createElement } from "react";
import { BangarlabDynamicNavigationPreviewProps } from "./types/widget.types";

export function preview(props: BangarlabDynamicNavigationPreviewProps): ReactElement {
    return (
        <div className="bangarlab-navigation-preview">
            <div className="preview-info">
                <p>Layout: {props.layout}</p>
                <p>Position: {props.position}</p>
                <p>Sidebar Width: {props.sidebarWidth}</p>
                <p>Topbar Height: {props.topbarHeight}</p>
                <p>Theme Color: <span style={{ color: props.themeColor }}>{props.themeColor}</span></p>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/BangarlabDynamicNavigation.css");
}
