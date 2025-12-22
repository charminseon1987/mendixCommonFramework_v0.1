import { useState, useEffect, useCallback } from "react";
import type { BangarlabDynamicNavigationContainerProps } from "../types/widget.types";
import type { NavigationState } from "../types/navigation.types";
import { useMenuData } from "./useMenuData";

import {
  buildMenuTree,
  toggleMenuExpand,
  expandAllMenus,
  getExpandedMenuIds,
  saveExpandedMenuIds,
  restoreMenuExpansion,
  loadExpandedMenuIds,
  saveActiveMenuId,
  loadActiveMenuId
} from "../utils/menuHelpers";

export const initialState: NavigationState = {
  menuTree: [],
  activeMenuId: null,
  isLoading: true,
  error: null
};

export function useMenuState(
  props: BangarlabDynamicNavigationContainerProps
) {
  const [state, setState] = useState<NavigationState>(initialState);
  const menuData = useMenuData(props);

  /* 초기 로드 */
  useEffect(() => {
    if (!menuData) return;
 
    const tree = restoreMenuExpansion(
      buildMenuTree(menuData),
      loadExpandedMenuIds()
    );

    setState({
      menuTree: tree,
      activeMenuId: loadActiveMenuId(),
      isLoading: false,
      error: null
    });
  }, [menuData]);

  /* 메뉴 클릭 */
  const onMenuClick = useCallback((menuId: string) => {
    setState(prev => {
      saveActiveMenuId(menuId);
      saveExpandedMenuIds(getExpandedMenuIds(prev.menuTree));
      return { ...prev, activeMenuId: menuId };
    });
  }, []);

  /* 확장 / 축소 */
  const onToggleExpand = useCallback((menuId: string) => {
    setState(prev => {
      const tree = toggleMenuExpand(prev.menuTree, menuId);
      saveExpandedMenuIds(getExpandedMenuIds(tree));
      return { ...prev, menuTree: tree };
    });
  }, []);

  const onExpandAll = useCallback(() => {
    setState(prev => {
      const tree = expandAllMenus(prev.menuTree, true);
      saveExpandedMenuIds(getExpandedMenuIds(tree));
      return { ...prev, menuTree: tree };
    });
  }, []);

  const onCollapseAll = useCallback(() => {
    setState(prev => {
      const tree = expandAllMenus(prev.menuTree, false);
      saveExpandedMenuIds(getExpandedMenuIds(tree));
      return { ...prev, menuTree: tree };
    });
  }, []);

  return {
    ...state,
    handlers: {
      onMenuClick,
      onToggleExpand,
      onExpandAll,
      onCollapseAll
    }
  };
}
