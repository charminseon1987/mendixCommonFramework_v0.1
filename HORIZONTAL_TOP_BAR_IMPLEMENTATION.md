# Horizontal Top Bar 구현 가이드

## 🎯 목표
`props.layout === "horizontal" && props.position === "top"`일 때 상단 바(top bar)가 적용되도록 수정

---

## 📝 수정할 파일 목록

1. ✏️ `src/components/NavigationMenu.tsx`
2. ✏️ `src/components/MenuItem.tsx`
3. ✏️ `src/BangarlabDynamicNavigation.tsx`
4. ✏️ `src/ui/BangarlabDynamicNavigation.scss`

---

## 1️⃣ NavigationMenu.tsx 수정

### 📍 위치: `src/components/NavigationMenu.tsx`

### Step 1-1: Interface에 layout prop 추가

**위치:** 약 7-15번째 줄 (MenuItemProps interface)

**수정 전:**
```typescript
interface NavigationMenuProps {
  menuItems: MenuTreeNode[];
  activeMenuId: string | null;
  onMenuClick: (menuId: string, pageURL: string | undefined) => void;
  onToggleExpand: (menuId: string) => void;
  depth: number;
  maxDepth: number;
  showDepthIndicator: boolean;
}
```

**수정 후:**
```typescript
interface NavigationMenuProps {
  menuItems: MenuTreeNode[];
  activeMenuId: string | null;
  onMenuClick: (menuId: string, pageURL: string | undefined) => void;
  onToggleExpand: (menuId: string) => void;
  depth: number;
  maxDepth: number;
  showDepthIndicator: boolean;
  layout?: 'vertical' | 'horizontal'; // ⭐ 추가
}
```

---

### Step 1-2: 함수 파라미터에 layout 추가 및 조건부 렌더링

**위치:** export function NavigationMenu 시작 부분

**수정 전:**
```typescript
export function NavigationMenu({
  menuItems,
  activeMenuId,
  onMenuClick,
  onToggleExpand,
  depth,
  maxDepth,
  showDepthIndicator
}: NavigationMenuProps): ReactElement {

  return (
    <ul className={classNames('nav-menu', `depth-${depth}`)} role="menu">
      {menuItems.map(item => (
        <MenuItem
          key={item.menuId}
          item={item}
          isActive={activeMenuId === item.menuId}
          onMenuClick={onMenuClick}
          onToggleExpand={onToggleExpand}
          depth={depth}
          maxDepth={maxDepth}
          showDepthIndicator={showDepthIndicator}
        />
      ))}
    </ul>
  );
}
```

**수정 후:**
```typescript
export function NavigationMenu({
  menuItems,
  activeMenuId,
  onMenuClick,
  onToggleExpand,
  depth,
  maxDepth,
  showDepthIndicator,
  layout = 'vertical' // ⭐ 추가 (기본값 vertical)
}: NavigationMenuProps): ReactElement {

  // ⭐ Horizontal Top Bar 렌더링 (depth 0일 때만)
  if (layout === 'horizontal' && depth === 0) {
    return (
      <nav className="horizontal-navigation" role="navigation" aria-label="Main navigation">
        <ul className="horizontal-menu" role="menubar">
          {menuItems.map(item => (
            <MenuItem
              key={item.menuId}
              item={item}
              isActive={activeMenuId === item.menuId}
              onMenuClick={onMenuClick}
              onToggleExpand={onToggleExpand}
              depth={depth}
              maxDepth={maxDepth}
              showDepthIndicator={showDepthIndicator}
              layout={layout} // ⭐ layout 전달
            />
          ))}
        </ul>
      </nav>
    );
  }

  // ⭐ Vertical 또는 Horizontal의 서브메뉴 (depth 1+)
  return (
    <ul className={classNames('nav-menu', `depth-${depth}`)} role="menu">
      {menuItems.map(item => (
        <MenuItem
          key={item.menuId}
          item={item}
          isActive={activeMenuId === item.menuId}
          onMenuClick={onMenuClick}
          onToggleExpand={onToggleExpand}
          depth={depth}
          maxDepth={maxDepth}
          showDepthIndicator={showDepthIndicator}
          layout={layout} // ⭐ layout 전달
        />
      ))}
    </ul>
  );
}
```

---

## 2️⃣ MenuItem.tsx 수정

### 📍 위치: `src/components/MenuItem.tsx`

### Step 2-1: Interface에 layout prop 추가

**위치:** 약 7-15번째 줄 (MenuItemProps interface)

**수정 전:**
```typescript
interface MenuItemProps {
  item: MenuTreeNode;
  isActive: boolean;
  onMenuClick: (menuId: string, pageURL: string | undefined) => void;
  onToggleExpand: (menuId: string) => void;
  depth: number;
  maxDepth: number;
  showDepthIndicator: boolean;
}
```

**수정 후:**
```typescript
interface MenuItemProps {
  item: MenuTreeNode;
  isActive: boolean;
  onMenuClick: (menuId: string, pageURL: string | undefined) => void;
  onToggleExpand: (menuId: string) => void;
  depth: number;
  maxDepth: number;
  showDepthIndicator: boolean;
  layout?: 'vertical' | 'horizontal'; // ⭐ 추가
}
```

---

### Step 2-2: 함수 파라미터에 layout 추가

**위치:** export function MenuItem 시작 부분

**수정 전:**
```typescript
export function MenuItem({
  item,
  isActive,
  onMenuClick,
  onToggleExpand,
  depth,
  maxDepth,
  showDepthIndicator
}: MenuItemProps): ReactElement {
```

**수정 후:**
```typescript
export function MenuItem({
  item,
  isActive,
  onMenuClick,
  onToggleExpand,
  depth,
  maxDepth,
  showDepthIndicator,
  layout = 'vertical' // ⭐ 추가 (기본값 vertical)
}: MenuItemProps): ReactElement {
```

---

### Step 2-3: CSS 클래스 조건부 적용

**위치:** className 설정 부분 (약 20-30번째 줄)

**수정 전:**
```typescript
const itemClasses = classNames(
  'nav-item',
  `depth-${depth}`,
  {
    'active': isActive,
    'has-children': canExpand,
    'expanded': item.isExpanded
  }
);
```

**수정 후:**
```typescript
const itemClasses = classNames({
  // Vertical 스타일
  'nav-item': layout === 'vertical',
  [`depth-${depth}`]: layout === 'vertical',

  // Horizontal 스타일 (depth 0)
  'horizontal-menu-item': layout === 'horizontal' && depth === 0,
  [`h-depth-${depth}`]: layout === 'horizontal' && depth === 0,

  // 공통 상태
  'active': isActive,
  'has-children': canExpand,
  'expanded': item.isExpanded
});
```

---

### Step 2-4: Link 클래스 조건부 적용

**위치:** 메뉴 링크 div/button 부분

**수정 전:**
```typescript
<div className="nav-link" onClick={handleClick} ...>
```

**수정 후:**
```typescript
<div
  className={layout === 'horizontal' && depth === 0 ? 'horizontal-menu-link' : 'nav-link'}
  onClick={handleClick}
  ...
>
```

---

### Step 2-5: 재귀 호출 시 layout 전달

**위치:** 서브메뉴 렌더링 부분 (하단)

**수정 전:**
```typescript
{canExpand && item.isExpanded && (
  <NavigationMenu
    menuItems={item.children}
    activeMenuId={activeMenuId}
    onMenuClick={onMenuClick}
    onToggleExpand={onToggleExpand}
    depth={depth + 1}
    maxDepth={maxDepth}
    showDepthIndicator={showDepthIndicator}
  />
)}
```

**수정 후:**
```typescript
{canExpand && item.isExpanded && (
  <NavigationMenu
    menuItems={item.children}
    activeMenuId={activeMenuId}
    onMenuClick={onMenuClick}
    onToggleExpand={onToggleExpand}
    depth={depth + 1}
    maxDepth={maxDepth}
    showDepthIndicator={showDepthIndicator}
    layout={layout} // ⭐ 추가
  />
)}
```

---

## 3️⃣ BangarlabDynamicNavigation.tsx 수정

### 📍 위치: `src/BangarlabDynamicNavigation.tsx`

### Step 3-1: Horizontal 렌더링 부분 수정

**위치:** 약 449-464번째 줄

**수정 전:**
```typescript
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
```

**수정 후:**
```typescript
// 상단 레이아웃 (가로형) - NavigationMenu 사용
if (props.layout === "horizontal" && props.position === "top") {
    return (
        <div className={containerClasses} style={cssVariables}>
            {/* 홈 버튼 (선택사항) */}
            <div className="horizontal-nav-header">
                <button
                    className="home-button"
                    onClick={handleHomeClick}
                    title="홈으로 이동"
                    aria-label="홈으로 이동"
                    type="button"
                >
                    홈
                </button>
            </div>

            {/* ⭐ NavigationMenu를 horizontal layout으로 사용 */}
            <NavigationMenu
                menuItems={state.menuTree}
                activeMenuId={state.activeMenuId}
                onMenuClick={handleMenuClick}
                onToggleExpand={handleToggleExpand}
                depth={0}
                maxDepth={props.maxDepth}
                showDepthIndicator={props.showDepthIndicator}
                layout="horizontal" // ⭐ 핵심
            />
        </div>
    );
}
```

---

### Step 3-2: Import 정리 (선택사항)

**위치:** 파일 상단 import 부분

**수정 전:**
```typescript
import { HorizontalNavigation } from "./components/HorizontalNavigation";
```

**수정 후:**
```typescript
// import { HorizontalNavigation } from "./components/HorizontalNavigation"; // ⭐ 삭제 또는 주석
```

**참고:** NavigationMenu는 이미 import 되어 있으므로 추가 작업 불필요

---

## 4️⃣ SCSS 스타일 추가

### 📍 위치: `src/ui/BangarlabDynamicNavigation.scss`

### Step 4-1: Horizontal Navigation 스타일 추가

**위치:** 파일 하단에 추가

```scss
// ========================================
// Horizontal Navigation (Top Bar)
// ========================================

.horizontal-navigation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 60px;
  z-index: 1000;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);

  .horizontal-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0 24px;
    gap: 4px;
    height: 100%;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
  }
}

// Horizontal Menu Item (Depth 0)
.horizontal-menu-item {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;

  .horizontal-menu-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    height: 100%;
    border: none;
    background: transparent;
    color: #1f2937;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 6px;

    i {
      font-size: 18px;
    }

    .menu-label {
      line-height: 1;
    }

    &:hover {
      background: rgba(24, 144, 255, 0.08);
      color: #1890ff;
    }

    &:focus {
      outline: 2px solid #1890ff;
      outline-offset: 2px;
    }
  }

  // 활성 상태
  &.active > .horizontal-menu-link {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  // 드롭다운 화살표
  &.has-children {
    .horizontal-menu-link {
      padding-right: 32px;
    }

    .dropdown-arrow {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      transition: transform 0.2s ease;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 4px;

      svg {
        display: block;
      }

      &.expanded {
        transform: translateY(-50%) rotate(180deg);
      }
    }
  }

  // 드롭다운 메뉴 (Depth 1+)
  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 220px;
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    margin-top: 4px;
    padding: 8px 0;
    z-index: 1001;
    animation: dropdownFadeIn 0.2s ease;
    list-style: none;

    // Depth 2+ 서브메뉴 (우측 확장)
    .nav-menu {
      position: absolute;
      top: 0;
      left: 100%;
      margin-top: 0;
      margin-left: 4px;
      animation: submenuSlideIn 0.2s ease;
    }

    .nav-item {
      position: relative;

      .nav-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        color: #1f2937;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;

        i {
          font-size: 16px;
        }

        .menu-label {
          flex: 1;
        }

        &:hover {
          background: rgba(24, 144, 255, 0.08);
          color: #1890ff;
        }
      }

      &.active > .nav-link {
        background: rgba(24, 144, 255, 0.08);
        color: #1890ff;
        font-weight: 600;
      }

      &.has-children {
        .nav-link {
          padding-right: 32px;
        }

        .dropdown-arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
        }
      }
    }
  }
}

// 홈 버튼 (선택사항)
.horizontal-nav-header {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  .home-button {
    border: none;
    background: none;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 18px;
    font-weight: 700;
    color: #1890ff;
    transition: all 0.2s;

    &:hover {
      color: #096dd9;
      transform: translateX(2px);
    }

    &:focus {
      outline: 2px solid #1890ff;
      outline-offset: 4px;
      border-radius: 4px;
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

// 반응형: 모바일
@media (max-width: 768px) {
  .horizontal-navigation {
    height: auto;
    position: relative;

    .horizontal-menu {
      flex-direction: column;
      padding: 12px;
      gap: 4px;
      align-items: stretch;
    }
  }

  .horizontal-menu-item {
    width: 100%;
    height: auto;

    .horizontal-menu-link {
      width: 100%;
      height: 48px;
    }

    .nav-menu {
      position: static;
      box-shadow: none;
      border: none;
      margin: 0;
      padding-left: 16px;
      animation: none;

      .nav-menu {
        position: static;
        margin: 0;
        padding-left: 32px;
      }
    }
  }
}
```

---

## ✅ 수정 완료 체크리스트

- [ ] `NavigationMenu.tsx`: interface에 `layout` prop 추가
- [ ] `NavigationMenu.tsx`: 함수 파라미터에 `layout` 추가 (기본값 'vertical')
- [ ] `NavigationMenu.tsx`: Horizontal 조건부 렌더링 추가
- [ ] `NavigationMenu.tsx`: MenuItem에 `layout` prop 전달
- [ ] `MenuItem.tsx`: interface에 `layout` prop 추가
- [ ] `MenuItem.tsx`: 함수 파라미터에 `layout` 추가 (기본값 'vertical')
- [ ] `MenuItem.tsx`: CSS 클래스 조건부 적용
- [ ] `MenuItem.tsx`: Link 클래스 조건부 적용
- [ ] `MenuItem.tsx`: 재귀 호출 시 `layout` 전달
- [ ] `BangarlabDynamicNavigation.tsx`: Horizontal 렌더링 부분 수정
- [ ] `BangarlabDynamicNavigation.tsx`: `layout="horizontal"` 전달
- [ ] `BangarlabDynamicNavigation.scss`: Horizontal 스타일 추가
- [ ] 테스트: Vertical 동작 확인 (기존 기능 유지)
- [ ] 테스트: Horizontal 동작 확인 (top bar 표시)
- [ ] 테스트: 드롭다운 클릭 동작 확인
- [ ] 테스트: 페이지 이동 동작 확인

---

## 🎯 핵심 포인트

### ✅ 변경되지 않는 것
- BangarlabDynamicNavigation의 로직
- 데이터 처리 (`buildMenuTree`)
- 이벤트 핸들러 (`handleMenuClick`, `handleToggleExpand`)
- Vertical navigation 기능

### ✅ 변경되는 것
- NavigationMenu와 MenuItem에 `layout` prop 추가 (선택적, 기본값 'vertical')
- Horizontal 렌더링 시 다른 CSS 클래스 사용
- BangarlabDynamicNavigation에서 `layout="horizontal"` 전달

### ✅ 결과
- `props.layout === "horizontal" && props.position === "top"` 일 때
- 상단에 고정된 가로형 네비게이션 바 표시
- 클릭 시 드롭다운 동작
- 데이터와 로직은 Vertical과 100% 동일

---

## 🚀 적용 순서

1. **NavigationMenu.tsx** 수정 (Step 1-1, 1-2)
2. **MenuItem.tsx** 수정 (Step 2-1 ~ 2-5)
3. **BangarlabDynamicNavigation.tsx** 수정 (Step 3-1)
4. **SCSS** 스타일 추가 (Step 4-1)
5. **테스트**: Vertical 동작 확인
6. **테스트**: Horizontal 동작 확인

이렇게 하면 기존 기능은 그대로 유지하면서 Horizontal top bar가 적용됩니다!
