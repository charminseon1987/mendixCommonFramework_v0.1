import type { MenuTreeNode } from "./menu.types";

export interface NavigationState {
  menuTree: MenuTreeNode[];
  activeMenuId: string | null;
  isLoading: boolean;
  error: string | null;
}
