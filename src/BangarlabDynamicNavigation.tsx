// src/BangarlabDynamicNavigation.tsx
import { createElement, useState } from "react";
import { BangarlabDynamicNavigationContainerProps } from "./types/widget.types";
import "./ui/BangarlabDynamicNavigation.scss";
import { useMenuState } from "./hooks/useMenuState";
import { useNavigation } from "./hooks/useNavigation";
import { Error } from "./components/Error";
import { Loading } from "./components/Loading";
import { SidebarLayout } from "./components/SidebarLayout";

export function BangarlabDynamicNavigation(
  props: BangarlabDynamicNavigationContainerProps
) {
  const { menuTree, activeMenuId, isLoading, error, handlers } =
    useMenuState(props);

  const { navigateToPage, navigateHome } = useNavigation();

  /** 🔹 사이드바 접힘 상태 */
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <SidebarLayout
      menuTree={menuTree}
      activeMenuId={activeMenuId}

      collapsible={props.collapsible}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(prev => !prev)}

      onMenuClick={(id, url) => {
        handlers.onMenuClick(id);
        navigateToPage(url);
      }}
      onToggleExpand={handlers.onToggleExpand}
      onHomeClick={navigateHome}
      onExpandAll={handlers.onExpandAll}
      onCollapseAll={handlers.onCollapseAll}
    />
  );
}
