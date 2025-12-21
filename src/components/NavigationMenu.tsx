// src/components/NavigationMenu.tsx

import { ReactElement, createElement } from 'react';
import { MenuItem } from './MenuItem';
import { MenuTreeNode } from '../types/menu.types';

interface NavigationMenuProps {
  menuItems: MenuTreeNode[];
  activeMenuId: string | null;
  onMenuClick: (menuId: string, pageName: string | undefined, hasChildren: boolean) => void;
  onToggleExpand: (menuId: string) => void;
  depth?: number;
  maxDepth?: number;
  showDepthIndicator?: boolean;
  position?: string;
}

export function NavigationMenu({
  menuItems,
  activeMenuId,
  onMenuClick,
  onToggleExpand,
  depth = 0,
  maxDepth = 2,
  showDepthIndicator = false,
  position
}: NavigationMenuProps): ReactElement {
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="nav-empty-state" role="status">
        <p>사용 가능한 메뉴가 없습니다.</p>
      </div>
    );
  }

  return (
    <ul className={`nav-menu depth-${depth}`} role="menu">
      {menuItems.map(item => (
        <MenuItem
          key={item.menuId}
          item={item}
          isActive={activeMenuId === item.menuId}
          activeMenuId={activeMenuId}
          onMenuClick={onMenuClick}
          onToggleExpand={onToggleExpand}
          depth={depth}
          maxDepth={maxDepth}
          showDepthIndicator={showDepthIndicator}
          position={position}
        />
      ))}
    </ul>
  );
}