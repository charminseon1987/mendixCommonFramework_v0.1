# Horizontal Navigation 개발 가이드 (별도 컴포넌트 방식)

## 📋 목차
1. [개발 전략](#1-개발-전략)
2. [프로젝트 현황 분석](#2-프로젝트-현황-분석)
3. [참조 디자인 분석](#3-참조-디자인-분석)
4. [개발 단계별 가이드](#4-개발-단계별-가이드)
5. [구현 체크리스트](#5-구현-체크리스트)

---

## 1. 개발 전략

### 1.1 아키텍처 설계

**🎯 핵심 전략: 기존 코드를 건드리지 않고 별도 컴포넌트로 분리**

```
BangarlabDynamicNavigation.tsx (메인 위젯)
├── props.layout === "vertical"
│   └── 기존 코드 그대로 (362-441 라인)
│
└── props.layout === "horizontal"
    └── <HorizontalNavigation /> (새로운 컴포넌트)
```

### 1.2 새로운 파일 구조

```
src/
├── components/
│   ├── MenuItem.tsx (기존)
│   ├── NavigationMenu.tsx (기존)
│   ├── HorizontalNavigation.tsx (신규 ⭐)
│   └── horizontal/
│       ├── HorizontalMenuItem.tsx (신규 ⭐)
│       └── HorizontalDropdown.tsx (신규 ⭐)
└── ui/
    ├── BangarlabDynamicNavigation.scss (기존)
    └── HorizontalNavigation.scss (신규 ⭐)
```

### 1.3 장점

✅ **기존 코드 보호**: Vertical 네비게이션 코드는 전혀 수정하지 않음
✅ **관심사 분리**: Horizontal 로직이 독립적으로 관리됨
✅ **유지보수 용이**: 각 레이아웃의 코드가 명확히 분리됨
✅ **테스트 용이**: Horizontal만 독립적으로 테스트 가능
✅ **확장 가능**: 향후 다른 레이아웃 추가 시에도 동일한 패턴 적용 가능

---

## 2. 프로젝트 현황 분석

### 2.1 현재 구현된 기능

#### ✅ Vertical Navigation (완료)
- **파일 위치**: `src/BangarlabDynamicNavigation.tsx` (362-441 라인)
- **레이아웃**: 좌측 사이드바 방식
- **주요 기능**:
  - 고정 사이드바 (fixed position)
  - 접기/펼치기 기능 (collapsible)
  - 메뉴 확장/축소 (expand/collapse)
  - 활성 메뉴 하이라이트
  - 계층적 메뉴 트리 (최대 depth 지원)
  - localStorage 기반 상태 저장

#### 📂 주요 컴포넌트 구조
```
BangarlabDynamicNavigation.tsx (메인 위젯)
├── NavigationMenu.tsx (메뉴 리스트)
└── MenuItem.tsx (개별 메뉴 아이템)
    └── 재귀적으로 하위 메뉴 렌더링
```

### 2.2 위젯 설정 (XML)

```xml
<property key="layout" type="enumeration" defaultValue="vertical">
    <enumerationValue key="vertical">Vertical (Sidebar)</enumerationValue>
    <enumerationValue key="horizontal">Horizontal (Topbar)</enumerationValue>
</property>
```

**참고**: XML 설정은 이미 준비되어 있으며, `layout="horizontal"` 옵션이 정의되어 있음

---

## 3. 참조 디자인 분석

### 3.1 국민연금 홈페이지 네비게이션 특징
**URL**: https://www.nps.or.kr/cmuctjng/custdscsn/getOHAD0002M0List.do?menuId=MN25000128

#### 🎯 주요 특징
1. **수평 메뉴바**: 상단에 고정된 가로형 네비게이션
2. **다단계 드롭다운**: 최대 4단계 계층 구조
3. **호버 기반 확장**: 마우스 오버 시 하위 메뉴 표시
4. **파란색 강조**: 활성/호버 시 파란색 (#4486d4, #2d69c2) 사용
5. **전체메뉴 토글**: 모든 메뉴를 한 번에 보기 가능
6. **모바일 반응형**: 작은 화면에서 햄버거 메뉴로 전환 (420px breakpoint)

#### 📐 레이아웃 구조
```
┌────────────────────────────────────────────────────┐
│  [Logo]  메뉴1  메뉴2  메뉴3  메뉴4  메뉴5  [전체] │ ← 메인 메뉴바
├────────────────────────────────────────────────────┤
│         ┌──────────────────┐                       │
│         │ 하위메뉴 1-1     │                       │ ← 드롭다운
│         │ 하위메뉴 1-2  →  │ [3차 메뉴들...]       │
│         │ 하위메뉴 1-3     │                       │
│         └──────────────────┘                       │
└────────────────────────────────────────────────────┘
```

---

## 4. 개발 단계별 가이드

### 4.1 1단계: HorizontalNavigation 메인 컴포넌트 생성

#### 📍 작업 파일: `src/components/HorizontalNavigation.tsx` (신규 생성)

#### 🎯 목표
Horizontal 레이아웃 전용 메인 컴포넌트 생성

#### 📝 구현 내용

**파일 전체 코드**:

```typescript
// src/components/HorizontalNavigation.tsx

import { ReactElement, createElement, useState, useCallback } from "react";
import classNames from "classnames";
import { MenuTreeNode } from "../types/menu.types";
import { HorizontalMenuItem } from "./horizontal/HorizontalMenuItem";
import "../ui/HorizontalNavigation.scss";

interface HorizontalNavigationProps {
  menuTree: MenuTreeNode[];
  activeMenuId: string | null;
  onMenuClick: (menuId: string, pageURL: string | undefined, hasChildren: boolean) => void;
  onHomeClick: () => void;
  maxDepth: number;
  showDepthIndicator: boolean;
  themeColor: string;
}

export function HorizontalNavigation({
  menuTree,
  activeMenuId,
  onMenuClick,
  onHomeClick,
  maxDepth,
  showDepthIndicator,
  themeColor
}: HorizontalNavigationProps): ReactElement {
  // 모바일 메뉴 토글 상태
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 호버된 메뉴 ID (드롭다운 표시용)
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);

  // 모바일 메뉴 토글
  const handleToggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // 메뉴 호버 시작
  const handleMenuHover = useCallback((menuId: string) => {
    setHoveredMenuId(menuId);
  }, []);

  // 메뉴 호버 종료
  const handleMenuLeave = useCallback(() => {
    // 약간의 지연을 두어 UX 개선 (마우스가 드롭다운으로 이동할 시간 확보)
    setTimeout(() => {
      setHoveredMenuId(null);
    }, 150);
  }, []);

  // 드롭다운 영역 호버 (드롭다운이 닫히지 않도록)
  const handleDropdownHover = useCallback((menuId: string) => {
    setHoveredMenuId(menuId);
  }, []);

  return (
    <nav
      className="horizontal-navigation"
      role="navigation"
      aria-label="Main navigation"
      style={{ "--theme-color": themeColor } as React.CSSProperties}
    >
      <div className="horizontal-nav-container">
        {/* 헤더 (홈 버튼) */}
        <div className="horizontal-nav-header">
          <button
            className="home-button"
            onClick={onHomeClick}
            title="홈으로 이동"
            aria-label="홈으로 이동"
            type="button"
          >
            <span className="home-icon">🏠</span>
            <span className="home-text">홈</span>
          </button>
        </div>

        {/* 메인 메뉴 (Depth 0) */}
        <ul
          className={classNames("horizontal-menu", {
            "mobile-open": isMobileMenuOpen
          })}
          role="menubar"
        >
          {menuTree.map(item => (
            <HorizontalMenuItem
              key={item.menuId}
              item={item}
              isActive={activeMenuId === item.menuId}
              activeMenuId={activeMenuId}
              onMenuClick={onMenuClick}
              onMenuHover={handleMenuHover}
              onMenuLeave={handleMenuLeave}
              onDropdownHover={handleDropdownHover}
              isHovered={hoveredMenuId === item.menuId}
              depth={0}
              maxDepth={maxDepth}
              showDepthIndicator={showDepthIndicator}
            />
          ))}
        </ul>

        {/* 모바일 토글 버튼 */}
        <div className="horizontal-nav-controls">
          <button
            className="mobile-menu-toggle"
            onClick={handleToggleMobileMenu}
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMobileMenuOpen}
            type="button"
          >
            <span className="menu-icon">
              {isMobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
```

---

### 4.2 2단계: HorizontalMenuItem 컴포넌트 생성

#### 📍 작업 파일: `src/components/horizontal/HorizontalMenuItem.tsx` (신규 생성)

#### 🎯 목표
Horizontal 레이아웃 전용 메뉴 아이템 컴포넌트

#### 📝 구현 내용

```typescript
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
  onMenuHover: (menuId: string) => void;
  onMenuLeave: () => void;
  onDropdownHover: (menuId: string) => void;
  isHovered: boolean;
  depth: number;
  maxDepth: number;
  showDepthIndicator: boolean;
}

export function HorizontalMenuItem({
  item,
  isActive,
  activeMenuId,
  onMenuClick,
  onMenuHover,
  onMenuLeave,
  onDropdownHover,
  isHovered,
  depth,
  maxDepth,
  showDepthIndicator
}: HorizontalMenuItemProps): ReactElement {
  const hasChildren = item.children && item.children.length > 0;
  const canExpand = hasChildren && depth < maxDepth;

  // 메뉴 클릭 핸들러
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMenuClick(item.menuId, item.pageURL, hasChildren);
  }, [item.menuId, item.pageURL, hasChildren, onMenuClick]);

  // 마우스 엔터 핸들러
  const handleMouseEnter = useCallback(() => {
    if (canExpand) {
      onMenuHover(item.menuId);
    }
  }, [canExpand, item.menuId, onMenuHover]);

  // 키보드 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch(e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleClick(e as any);
        break;
      case 'ArrowDown':
        if (canExpand) {
          e.preventDefault();
          onMenuHover(item.menuId);
        }
        break;
      case 'Escape':
        onMenuLeave();
        break;
    }
  }, [canExpand, handleClick, item.menuId, onMenuHover, onMenuLeave]);

  const itemClasses = classNames(
    'horizontal-menu-item',
    `depth-${depth}`,
    {
      'active': isActive,
      'has-dropdown': canExpand,
      'hovered': isHovered
    }
  );

  return (
    <li
      className={itemClasses}
      role="none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMenuLeave}
    >
      <button
        className="horizontal-menu-link"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="menuitem"
        aria-haspopup={canExpand}
        aria-expanded={isHovered}
        type="button"
      >
        {/* 아이콘 */}
        {item.iconClass && item.iconClass.trim() !== '' && (
          <i className={item.iconClass} aria-hidden="true"></i>
        )}

        {/* 메뉴명 */}
        <span className="menu-label">{item.menuName || '메뉴'}</span>

        {/* 드롭다운 화살표 */}
        {canExpand && (
          <svg className="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
            <path d="M5 6L0 0h10z" />
          </svg>
        )}

        {/* Depth 표시 (개발용) */}
        {showDepthIndicator && (
          <span className="depth-indicator" aria-label={`Depth ${depth}`}>
            D{depth}
          </span>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      {canExpand && isHovered && (
        <HorizontalDropdown
          items={item.children}
          activeMenuId={activeMenuId}
          onMenuClick={onMenuClick}
          onDropdownHover={onDropdownHover}
          parentMenuId={item.menuId}
          depth={depth + 1}
          maxDepth={maxDepth}
          showDepthIndicator={showDepthIndicator}
        />
      )}
    </li>
  );
}
```

---

### 4.3 3단계: HorizontalDropdown 컴포넌트 생성

#### 📍 작업 파일: `src/components/horizontal/HorizontalDropdown.tsx` (신규 생성)

#### 🎯 목표
드롭다운 메뉴 및 서브메뉴 컴포넌트

#### 📝 구현 내용

```typescript
// src/components/horizontal/HorizontalDropdown.tsx

import { ReactElement, createElement, useState, useCallback } from "react";
import classNames from "classnames";
import { MenuTreeNode } from "../../types/menu.types";

interface HorizontalDropdownProps {
  items: MenuTreeNode[];
  activeMenuId: string | null;
  onMenuClick: (menuId: string, pageURL: string | undefined, hasChildren: boolean) => void;
  onDropdownHover: (menuId: string) => void;
  parentMenuId: string;
  depth: number;
  maxDepth: number;
  showDepthIndicator: boolean;
}

export function HorizontalDropdown({
  items,
  activeMenuId,
  onMenuClick,
  onDropdownHover,
  parentMenuId,
  depth,
  maxDepth,
  showDepthIndicator
}: HorizontalDropdownProps): ReactElement {
  // 호버된 서브메뉴 ID
  const [hoveredSubmenuId, setHoveredSubmenuId] = useState<string | null>(null);

  // 서브메뉴 아이템 호버
  const handleSubmenuHover = useCallback((menuId: string) => {
    setHoveredSubmenuId(menuId);
  }, []);

  // 서브메뉴 호버 종료
  const handleSubmenuLeave = useCallback(() => {
    setHoveredSubmenuId(null);
  }, []);

  return (
    <div
      className={classNames("horizontal-dropdown", `depth-${depth}`)}
      role="menu"
      onMouseEnter={() => onDropdownHover(parentMenuId)}
    >
      <ul className="dropdown-menu">
        {items.map(item => {
          const hasChildren = item.children && item.children.length > 0;
          const canExpand = hasChildren && depth < maxDepth;
          const isActive = activeMenuId === item.menuId;
          const isHovered = hoveredSubmenuId === item.menuId;

          return (
            <li
              key={item.menuId}
              className={classNames('dropdown-item', {
                'active': isActive,
                'has-submenu': canExpand,
                'hovered': isHovered
              })}
              role="none"
              onMouseEnter={() => canExpand && handleSubmenuHover(item.menuId)}
              onMouseLeave={handleSubmenuLeave}
            >
              <button
                className="dropdown-link"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMenuClick(item.menuId, item.pageURL, hasChildren);
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
              {canExpand && isHovered && (
                <HorizontalDropdown
                  items={item.children}
                  activeMenuId={activeMenuId}
                  onMenuClick={onMenuClick}
                  onDropdownHover={onDropdownHover}
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
```

---

### 4.4 4단계: 메인 위젯에서 HorizontalNavigation 사용

#### 📍 작업 파일: `src/BangarlabDynamicNavigation.tsx`

#### 🎯 목표
layout prop에 따라 HorizontalNavigation 컴포넌트 렌더링

#### 📝 구현 내용

**4단계-1: import 추가** (파일 상단에)

```typescript
// 기존 import 아래에 추가
import { HorizontalNavigation } from "./components/HorizontalNavigation";
```

**4단계-2: 레이아웃 조건 분기 수정** (442 라인 위치)

기존 코드:
```typescript
// 좌측 레이아웃 (세로형)
if (props.layout === "vertical" && props.position === "left") {
    return (
        // ... 기존 vertical 레이아웃 코드 ...
    );
}

// 기본 레이아웃
return (
    <div className={containerClasses} style={cssVariables}>
        <NavigationMenu ... />
    </div>
);
```

다음과 같이 수정:
```typescript
// 좌측 레이아웃 (세로형)
if (props.layout === "vertical" && props.position === "left") {
    return (
        // ... 기존 vertical 레이아웃 코드 (전혀 수정하지 않음) ...
    );
}

// 상단 레이아웃 (가로형) - 새로 추가
if (props.layout === "horizontal" && props.position === "top") {
    return (
        <div className={containerClasses} style={cssVariables}>
            <HorizontalNavigation
                menuTree={state.menuTree}
                activeMenuId={state.activeMenuId}
                onMenuClick={handleMenuClick}
                onHomeClick={handleHomeClick}
                maxDepth={props.maxDepth}
                showDepthIndicator={props.showDepthIndicator}
                themeColor={props.themeColor}
            />
        </div>
    );
}

// 기본 레이아웃 (fallback)
return (
    <div className={containerClasses} style={cssVariables}>
        <NavigationMenu
            menuItems={state.menuTree}
            activeMenuId={state.activeMenuId}
            onMenuClick={handleMenuClick}
            onToggleExpand={handleToggleExpand}
            depth={0}
            maxDepth={props.maxDepth}
            showDepthIndicator={props.showDepthIndicator}
        />
    </div>
);
```

---

### 4.5 5단계: SCSS 스타일링

#### 📍 작업 파일: `src/ui/HorizontalNavigation.scss` (신규 생성)

#### 🎯 목표
Horizontal 네비게이션 전용 스타일 시트

#### 📝 구현 내용

**파일 전체 코드**:

```scss
// src/ui/HorizontalNavigation.scss

@use "sass:color";

.horizontal-navigation {
  --theme-color: #1890ff;
  --theme-color-dark: #096dd9;
  --border-color: #e8e8e8;
  --hover-bg: rgba(24, 144, 255, 0.08);
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-active: #ffffff;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 60px;
  z-index: 1000;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;

  * {
    box-sizing: border-box;
  }

  // 컨테이너
  .horizontal-nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    gap: 32px;
  }

  // 헤더 (홈 버튼)
  .horizontal-nav-header {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    .home-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: none;
      background: linear-gradient(135deg, var(--theme-color) 0%, var(--theme-color-dark) 100%);
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);

      .home-icon {
        font-size: 18px;
        line-height: 1;
      }

      .home-text {
        line-height: 1;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      &:active {
        transform: translateY(0);
      }

      &:focus {
        outline: 2px solid var(--theme-color);
        outline-offset: 2px;
      }
    }
  }

  // 메인 메뉴 (Depth 0)
  .horizontal-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 4px;
    flex: 1;
    height: 100%;
    align-items: center;
  }

  // 메뉴 아이템 (Depth 0)
  .horizontal-menu-item {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;

    &.depth-0 {
      // Depth 0 전용 스타일
    }

    // 드롭다운 있는 항목
    &.has-dropdown {
      .horizontal-menu-link {
        padding-right: 32px;
      }

      .dropdown-arrow {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        transition: transform 0.2s ease;
      }
    }

    // 호버 상태
    &.hovered {
      .horizontal-menu-link {
        background: var(--hover-bg);
        color: var(--theme-color);
      }

      .dropdown-arrow {
        transform: translateY(-50%) rotate(180deg);
      }
    }

    // 활성 상태
    &.active > .horizontal-menu-link {
      background: linear-gradient(135deg, var(--theme-color) 0%, var(--theme-color-dark) 100%);
      color: var(--text-active);
      font-weight: 600;
      box-shadow: var(--shadow-sm);
    }
  }

  // 메뉴 링크 (Depth 0)
  .horizontal-menu-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    height: 100%;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 6px;
    position: relative;

    i {
      font-size: 18px;
    }

    .menu-label {
      line-height: 1;
    }

    &:hover {
      background: var(--hover-bg);
      color: var(--theme-color);
    }

    &:focus {
      outline: 2px solid var(--theme-color);
      outline-offset: 2px;
    }

    .depth-indicator {
      margin-left: 8px;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 600;
      background: rgba(24, 144, 255, 0.1);
      border-radius: 4px;
      color: var(--theme-color);
    }
  }

  // 드롭다운 메뉴 (Depth 1+)
  .horizontal-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 220px;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    margin-top: 4px;
    z-index: 1001;
    animation: dropdownFadeIn 0.2s ease;
    backdrop-filter: blur(10px);
    overflow: hidden;

    &.depth-1 {
      // Depth 1 전용 스타일
    }

    // Depth 2 이상 (우측 확장)
    &.depth-2,
    &.depth-3 {
      position: absolute;
      top: 0;
      left: 100%;
      margin-top: 0;
      margin-left: 4px;
      animation: submenuSlideIn 0.2s ease;
    }

    .dropdown-menu {
      list-style: none;
      margin: 0;
      padding: 8px 0;
    }
  }

  // 드롭다운 아이템
  .dropdown-item {
    position: relative;

    &.has-submenu {
      .dropdown-link {
        padding-right: 32px;

        .submenu-arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--text-secondary);
          transition: color 0.2s ease;
        }
      }
    }

    &.hovered > .dropdown-link {
      background: var(--hover-bg);
      color: var(--theme-color);

      .submenu-arrow {
        color: var(--theme-color);
      }
    }

    &.active > .dropdown-link {
      background: var(--hover-bg);
      color: var(--theme-color);
      font-weight: 600;
    }
  }

  // 드롭다운 링크
  .dropdown-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    gap: 8px;

    i {
      font-size: 16px;
      flex-shrink: 0;
    }

    .menu-label {
      flex: 1;
      line-height: 1.4;
    }

    &:hover {
      background: var(--hover-bg);
      color: var(--theme-color);
    }

    &:focus {
      outline: 2px solid var(--theme-color);
      outline-offset: -2px;
    }

    .depth-indicator {
      margin-left: auto;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 600;
      background: rgba(24, 144, 255, 0.1);
      border-radius: 4px;
      color: var(--theme-color);
      flex-shrink: 0;
    }
  }

  // 모바일 컨트롤
  .horizontal-nav-controls {
    display: none;
    align-items: center;
    flex-shrink: 0;

    .mobile-menu-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 1.5px solid var(--border-color);
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 24px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);

      .menu-icon {
        line-height: 1;
      }

      &:hover {
        border-color: var(--theme-color);
        color: var(--theme-color);
        background: var(--hover-bg);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      &:active {
        transform: translateY(0);
      }

      &:focus {
        outline: 2px solid var(--theme-color);
        outline-offset: 2px;
      }
    }
  }

  // 애니메이션
  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes submenuSlideIn {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  // 반응형: 모바일 (768px 이하)
  @media (max-width: 768px) {
    height: auto;
    min-height: 60px;

    .horizontal-nav-container {
      flex-wrap: wrap;
      padding: 12px;
      gap: 12px;
    }

    .horizontal-nav-header {
      flex: 1;
    }

    .horizontal-nav-controls {
      display: flex;
    }

    .horizontal-menu {
      display: none;
      flex-direction: column;
      width: 100%;
      height: auto;
      gap: 4px;

      &.mobile-open {
        display: flex;
      }
    }

    .horizontal-menu-item {
      width: 100%;
      height: auto;

      .horizontal-menu-link {
        width: 100%;
        height: 48px;
        justify-content: space-between;
      }
    }

    .horizontal-dropdown {
      position: static;
      border: none;
      box-shadow: none;
      margin: 0;
      padding-left: 16px;
      animation: none;

      &.depth-2,
      &.depth-3 {
        position: static;
        margin: 0;
        padding-left: 32px;
      }
    }
  }

  // 반응형: 태블릿 (768px - 1024px)
  @media (min-width: 769px) and (max-width: 1024px) {
    .horizontal-menu {
      gap: 2px;
    }

    .horizontal-menu-link {
      padding: 8px 12px;
      font-size: 14px;
    }
  }
}

// 국민연금 스타일 테마 (선택사항)
.horizontal-navigation.theme-nps {
  --theme-color: #4486d4;
  --theme-color-dark: #2d69c2;
}
```

---

### 4.6 6단계: 타입 정의 확인

#### 📍 작업 파일: `src/types/menu.types.ts`

#### 🎯 목표
기존 타입이 Horizontal에서도 사용 가능한지 확인

#### 📝 확인 사항

기존 타입들이 이미 잘 정의되어 있으므로 **수정 불필요**:

- `MenuItemData`: ✅
- `MenuTreeNode`: ✅
- `NavigationState`: ✅
- `NavigationLayout`: ✅

---

## 5. 구현 체크리스트

### 5.1 파일 생성 체크리스트

- [ ] `src/components/HorizontalNavigation.tsx` 생성
- [ ] `src/components/horizontal/HorizontalMenuItem.tsx` 생성
- [ ] `src/components/horizontal/HorizontalDropdown.tsx` 생성
- [ ] `src/ui/HorizontalNavigation.scss` 생성

### 5.2 기존 파일 수정 체크리스트

- [ ] `src/BangarlabDynamicNavigation.tsx`
  - [ ] HorizontalNavigation import 추가 (1줄)
  - [ ] 레이아웃 조건 분기 추가 (약 15줄)
  - [ ] **기존 vertical 코드는 전혀 수정하지 않음** ⭐

### 5.3 기능 테스트 체크리스트

#### 기본 기능
- [ ] `layout="horizontal"` 설정 시 HorizontalNavigation 렌더링
- [ ] `layout="vertical"` 설정 시 기존 vertical 레이아웃 정상 동작 (영향 없음)
- [ ] Depth 0 메뉴 호버 시 드롭다운 표시
- [ ] Depth 1 메뉴 클릭 시 페이지 이동
- [ ] Depth 2 서브메뉴 우측 확장
- [ ] 활성 메뉴 하이라이트
- [ ] 홈 버튼 클릭 시 홈으로 이동

#### 반응형
- [ ] 데스크톱 (1920px): 정상 표시
- [ ] 태블릿 (768px): 메뉴 간격 조정
- [ ] 모바일 (420px): 햄버거 메뉴 전환

#### 브라우저 호환성
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

#### 접근성
- [ ] 키보드 네비게이션 (Tab, Enter, Arrow keys)
- [ ] 스크린 리더 지원 (ARIA 속성)
- [ ] 포커스 표시

---

## 6. 개발 순서

### Phase 1: 파일 생성 (1일)
1. `HorizontalNavigation.tsx` 생성
2. `HorizontalMenuItem.tsx` 생성
3. `HorizontalDropdown.tsx` 생성
4. `HorizontalNavigation.scss` 생성

### Phase 2: 통합 (0.5일)
1. `BangarlabDynamicNavigation.tsx`에 import 추가
2. 레이아웃 조건 분기 추가

### Phase 3: 테스트 & 디버깅 (1일)
1. 기능 테스트
2. 반응형 테스트
3. 브라우저 호환성 테스트
4. 접근성 테스트

### Phase 4: 최적화 (0.5일)
1. 성능 최적화
2. 코드 정리
3. 주석 추가

**총 예상 기간**: 약 3일

---

## 7. 장점 요약

### ✅ 기존 코드 완전 보호
- Vertical 네비게이션 코드는 **단 한 줄도 수정하지 않음**
- 기존 기능에 영향 없음

### ✅ 독립적 개발
- Horizontal 로직이 별도 파일에 격리됨
- 디버깅 및 유지보수 용이

### ✅ 확장 가능한 구조
- 향후 다른 레이아웃 추가 시 동일한 패턴 적용
- 예: `GridNavigation.tsx`, `MegaMenuNavigation.tsx` 등

### ✅ 테스트 용이
- Horizontal만 독립적으로 테스트 가능
- Vertical 회귀 테스트 불필요

---

## 8. 주의사항

### ⚠️ 중요
1. **기존 파일 수정 최소화**: `BangarlabDynamicNavigation.tsx`에서 2개 줄만 추가
2. **타입 공유**: 기존 타입을 재사용하여 일관성 유지
3. **스타일 충돌 방지**: 별도 SCSS 파일로 분리
4. **props 전달**: 필요한 props만 HorizontalNavigation에 전달

---

## 9. 다음 단계

1. ✅ 이 가이드를 따라 파일 생성
2. ✅ 코드 작성
3. ✅ 테스트
4. ✅ 배포

---

**문서 작성일**: 2025-12-19
**작성자**: Claude Code Assistant
**버전**: 2.0.0 (별도 컴포넌트 방식)
**프로젝트**: Mendix Dynamic Navigation Widget
