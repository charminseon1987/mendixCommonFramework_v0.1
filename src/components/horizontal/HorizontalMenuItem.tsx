// src/components/horizontal/HorizontalMenuItem.tsx

import { ReactElement, createElement, useCallback } from "react";
import classNames from "classnames";
import { MenuTreeNode } from "../../types/menu.types";
import { HorizontalDropdown } from "./HorizontalDropdown";

interface HorizontalMenuItemProps {
  item: MenuTreeNode;
  isActive: boolean;
  activeMenuId: string | null;
  onMenuClick: (menuId: string, pageURL: string | undefined, hasChildren: boolean) => void;
  onMenuToggle: (menuId: string) => void;
  isExpanded: boolean;
  depth: number;
  maxDepth: number;
  showDepthIndicator: boolean;
}

export function HorizontalMenuItem({
  item,
  isActive,
  activeMenuId,
  onMenuClick,
  onMenuToggle,
  isExpanded,
  depth,
  maxDepth,
  showDepthIndicator
}: HorizontalMenuItemProps): ReactElement {
  const hasChildren = item.children && item.children.length > 0;
  const canExpand = hasChildren && depth < maxDepth;

  // 메뉴명 클릭 핸들러 (자식 없으면 페이지 이동, 있으면 토글)
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasChildren) {
      // 자식 메뉴가 있으면 드롭다운 토글
      onMenuToggle(item.menuId);
    } else {
      // 자식 메뉴가 없으면 페이지 이동
      onMenuClick(item.menuId, item.pageURL, false);
    }
  }, [hasChildren, item.menuId, item.pageURL, onMenuClick, onMenuToggle]);

  // 화살표 버튼 클릭 핸들러 (드롭다운 토글만)
  const handleArrowClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (canExpand) {
      onMenuToggle(item.menuId);
    }
  }, [canExpand, item.menuId, onMenuToggle]);

  // 키보드 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch(e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleClick(e as any);
        break;
      case 'ArrowDown':
        if (canExpand && !isExpanded) {
          e.preventDefault();
          onMenuToggle(item.menuId);
        }
        break;
      case 'Escape':
        if (isExpanded) {
          e.preventDefault();
          onMenuToggle(item.menuId);
        }
        break;
    }
  }, [canExpand, handleClick, isExpanded, item.menuId, onMenuToggle]);

  const itemClasses = classNames(
    'horizontal-menu-item',
    `depth-${depth}`,
    {
      'active': isActive,
      'has-dropdown': canExpand,
      'expanded': isExpanded
    }
  );

  return (
    <li
      className={itemClasses}
      role="none"
    >
      <div
        className="horizontal-menu-link"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="menuitem"
        tabIndex={0}
        aria-label={item.menuName}
        // aria-haspopup={canExpand}
        // aria-expanded={isHovered}
      >
        {/* 아이콘 */}
        {item.iconClass && item.iconClass.trim() !== '' && (
          <span className="nav-icon" aria-hidden="true">

          <i className={item.iconClass} aria-hidden="true"></i>
          </span>
        )}

        {/* 메뉴명 */}
        <span className="menu-label">{item.menuName || '메뉴'}</span>

        {/* 드롭다운 화살표 */}
        {canExpand && (
          <button
            type="button"
            className={classNames('dropdown-arrow', {
              'expanded': isExpanded,
              'collapsed': !isExpanded
            })}
            onClick={handleArrowClick}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? '드롭다운 닫기' : '드롭다운 열기'}
            aria-hidden="false"
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
              <path d="M5 6L0 0h10z" />
            </svg>
          </button>
        )}

        {/* Depth 표시 (개발용) */}
        {showDepthIndicator && (
          <span className="depth-indicator" aria-label={`Depth ${depth}`}>
            D{depth}
          </span>
        )}
      </div>

      {/* 드롭다운 메뉴 */}
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
}