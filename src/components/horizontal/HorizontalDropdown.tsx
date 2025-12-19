// src/components/horizontal/HorizontalDropdown.tsx

import { ReactElement, createElement, useState, useCallback } from "react";
import classNames from "classnames";
import { MenuTreeNode } from "../../types/menu.types";

interface HorizontalDropdownProps {
  items: MenuTreeNode[];
  activeMenuId: string | null;
  onMenuClick: (menuId: string, pageURL: string | undefined, hasChildren: boolean) => void;
  onMenuToggle: (menuId: string) => void;
  parentMenuId: string;
  depth: number;
  maxDepth: number;
  showDepthIndicator: boolean;
}

export function HorizontalDropdown({
  items,
  activeMenuId,
  onMenuClick,
  onMenuToggle,
  parentMenuId,
  depth,
  maxDepth,
  showDepthIndicator
}: HorizontalDropdownProps): ReactElement {
  // 클릭으로 확장된 서브메뉴 ID
  const [expandedSubmenuId, setExpandedSubmenuId] = useState<string | null>(null);

  // 서브메뉴 클릭으로 토글
  const handleSubmenuToggle = useCallback((menuId: string) => {
    setExpandedSubmenuId(prev => prev === menuId ? null : menuId);
  }, []);

  return (
    <div
      className={classNames("horizontal-dropdown", `depth-${depth}`)}
      role="menu"
      data-parent-menu-id={parentMenuId}
      aria-labelledby={`menu-${parentMenuId}`}
    >
      <ul className="dropdown-menu">
        {items.map(item => {
          const hasChildren = item.children && item.children.length > 0;
          const canExpand = hasChildren && depth < maxDepth;
          const isActive = activeMenuId === item.menuId;
          const isExpanded = expandedSubmenuId === item.menuId;

          return (
            <li
              key={item.menuId}
              className={classNames('dropdown-item', {
                'active': isActive,
                'has-submenu': canExpand,
                'expanded': isExpanded
              })}
              role="none"
            >
              <button
                className="dropdown-link"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  console.log('[HorizontalDropdown] Clicked:', item.menuId, 'hasChildren:', hasChildren, 'depth:', depth);

                  if (hasChildren) {
                    // 자식 메뉴가 있으면 드롭다운 토글
                    console.log('[HorizontalDropdown] Toggle submenu:', item.menuId);
                    handleSubmenuToggle(item.menuId);
                  } else {
                    // 자식 메뉴가 없으면 페이지 이동
                    console.log('[HorizontalDropdown] Navigate to:', item.pageURL);
                    onMenuClick(item.menuId, item.pageURL, false);
                  }
                }}
                role="menuitem"
                type="button"
              >
                {/* 아이콘 */}
                {item.iconClass && item.iconClass.trim() !== '' && (
                  <i className={item.iconClass} aria-hidden="true"></i>
                )}

                {/* 메뉴명 */}
                <span className="menu-label">{item.menuName || '메뉴'}</span>

                {/* 서브메뉴 화살표 */}
                {canExpand && (
                  <span className="submenu-arrow">→</span>
                )}

                {/* Depth 표시 */}
                {showDepthIndicator && (
                  <span className="depth-indicator">D{depth}</span>
                )}
              </button>

              {/* Depth 2 서브메뉴 (우측 확장) */}
              {canExpand && isExpanded && (
                <HorizontalDropdown
                  items={item.children}
                  activeMenuId={activeMenuId}
                  onMenuClick={onMenuClick}
                  onMenuToggle={onMenuToggle}
                  parentMenuId={item.menuId}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  showDepthIndicator={showDepthIndicator}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}