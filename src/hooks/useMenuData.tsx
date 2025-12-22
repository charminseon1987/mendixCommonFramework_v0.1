import { useEffect, useState } from "react";
import { ValueStatus } from "mendix";
import { BangarlabDynamicNavigationContainerProps } from "../types/widget.types";
import { MenuItemData } from "../types/menu.types";

function getMxAttributes(item: any): Record<string, { value: any }> {
  const symbol = Object.getOwnPropertySymbols(item)
    .find(sym => sym.toString().includes("mxObject"));
  return symbol ? item[symbol]?._jsonData?.attributes ?? {} : {};
}

export function useMenuData(
  props: BangarlabDynamicNavigationContainerProps
): MenuItemData[] | null {
  const { menuDataSource, Resource } = props;
  console.log("menuDataSource", menuDataSource)
  console.log("resourceDataSource", Resource)
  const [menuData, setMenuData] = useState<MenuItemData[] | null>(null);

  useEffect(() => {
    if (
      menuDataSource.status !== ValueStatus.Available ||Resource?.status !== ValueStatus.Available
    ) {
      return;
    }

    const resourceMap = new Map<string, any>();

    // 🔹 Resource GUID → attributes
    Resource.items?.forEach(res => {
      const attrs = getMxAttributes(res);
      resourceMap.set(res.id, attrs);
    });

    console.log("resourceMap", resourceMap)
    
const result: MenuItemData[] =
  menuDataSource.items?.map(menu => {
    const attrs = getMxAttributes(menu);
  console.log("attrs", attrs)
    const assocValue =
      attrs["PortalModule.SyMenu_SyResource"]?.value;

  console.log("assocValue", assocValue)
    const resourceGuid =
      Array.isArray(assocValue) ? assocValue[0] : assocValue;

    const resourceAttrs = resourceGuid
      ? resourceMap.get(resourceGuid)
      : null;

  console.log("resourceAttrs", resourceAttrs )

    return {
      menuId: String(attrs.MenuId?.value ?? ""),
      menuName: String(attrs.MenuName?.value ?? ""),
      parentMenuId: attrs.ParentId?.value ?? null,
      depth: Number(attrs.Depth?.value ?? 0),
      sortNo: Number(attrs.SortNo?.value ?? 0),
      displayYn: attrs.DisplayYn?.value ?? "Y",
      enabledTF: attrs.EnableTF?.value !== false,

      // ✅ 이제 정상
      pageURL: resourceAttrs?.PageUrl?.value, // ← 대소문자 주의

      resourceName: resourceAttrs?.ResourceName?.value,
      resourceType: resourceAttrs?.ResourceType?.value,

      guid: menu.id
    };
  }) ?? [];

  

    setMenuData(result);
  }, [
    menuDataSource.status,
    menuDataSource.items,
    Resource?.status,
    Resource?.items
  ]);

  console.log("menudata", menuData)
  return menuData;
}
