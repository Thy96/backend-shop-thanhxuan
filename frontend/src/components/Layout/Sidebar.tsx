'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  ChevronDown,
  House,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  PackageOpen,
  UserRoundCog,
  LucideClipboardSignature,
  ShoppingBagIcon,
  List,
  Trash2,
  UserPenIcon,
} from 'lucide-react';
import { MenuProps } from '@/lib/types';

const optionSidebar: MenuProps[] = [
  {
    label: 'Trang chủ',
    url: '/admin',
    icon: <LayoutDashboard />,
  },
  {
    label: 'Bài viết',
    url: '/admin/notes',
    icon: <NotebookPen />,
    subMenu: [
      {
        label: 'Danh mục',
        url: '/admin/notes/categories',
        icon: <List className="w-5 h-5" />,
      },
      {
        label: 'Thùng rác',
        url: '/admin/notes/trash',
        icon: <Trash2 className="w-5 h-5" />,
      },
    ],
  },
  {
    label: 'Sản phẩm',
    url: '/admin/products',
    icon: <PackageOpen />,
    subMenu: [
      {
        label: 'Danh mục',
        url: '/admin/products/categories',
        icon: <List className="w-5 h-5" />,
      },
      {
        label: 'Thùng rác',
        url: '/admin/products/trash',
        icon: <Trash2 className="w-5 h-5" />,
      },
    ],
  },
  {
    label: 'Đơn hàng',
    url: '/admin/orders',
    icon: <ShoppingBagIcon />,
  },
  {
    label: 'Danh sách User',
    url: '/admin/users',
    icon: <LucideClipboardSignature />,
  },
  {
    label: 'Thông tin cá nhân',
    url: '/admin/users/profile',
    icon: <UserRoundCog />,
    subMenu: [
      {
        label: 'Đổi Mật Khẩu',
        url: '/admin/users/change-password',
        icon: <UserPenIcon className="w-5 h-5" />,
      },
    ],
  },
];
const Sidebar = () => {
  const params = useParams();
  const pathName = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null); // menu nào đang mở
  const activeSlugs = ['edit', 'create'];

  return (
    <aside className={` bg-gray-800 text-white flex flex-col relative w-max`}>
      <div
        className={`p-4 text-lg font-bold border-b border-gray-700 flex items-center gap-1`}
      >
        <span className="shrink-0 ">
          <House />
        </span>
        <span
          className={`
            whitespace-nowrap overflow-hidden`}
        >
          Thanh Xuân
        </span>
      </div>
      <nav className="flex-1 mt-3">
        {optionSidebar.map((sidebar, i) => {
          const hasSubMenu = !!sidebar.subMenu?.length;
          const isActive = activeSlugs.some((slug) =>
            pathName.startsWith(`${sidebar.url}/${slug}`),
          );

          // parent active nếu path bắt đầu bằng url (vd /admin/notes, /admin/notes/categories/create, ...)
          const isParentActive =
            pathName === sidebar.url || pathName.startsWith(`${sidebar.url}/`);

          // submenu nào active
          const subActiveUrl = sidebar.subMenu?.find(
            (sub) => pathName === sub.url || pathName.startsWith(`${sub.url}/`),
          )?.url;

          const isSubOpen =
            openMenu === sidebar.url ||
            !!subActiveUrl ||
            isActive ||
            isParentActive;

          return (
            <div key={i}>
              {/* ROW CHA */}
              <div className={`flex items-center gap-2`}>
                <Link
                  href={sidebar.url}
                  className={`flex-1 flex items-center gap-2 px-4 py-3 hover:bg-gray-700
                    ${
                      pathName === sidebar.url ||
                      isActive ||
                      (isActive && pathName.endsWith(`${params.id}`))
                        ? 'bg-gray-700'
                        : ''
                    }`}
                >
                  <span className="shrink-0">{sidebar.icon}</span>
                  <span
                    className={`
                      whitespace-nowrap overflow-hidden
                      transition-all duration-1000 ease-in-out`}
                  >
                    {sidebar.label}
                  </span>

                  {/* Nút toggle dropdown (chỉ hiện nếu có submenu & đang mở sidebar) */}
                  {hasSubMenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isSubOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </Link>
              </div>

              {/* SUBMENU */}
              {hasSubMenu && isSubOpen && (
                <div>
                  {sidebar.subMenu!.map((sub, idx) => {
                    const isSubActive =
                      pathName === sub.url ||
                      pathName.startsWith(`${sub.url}/`);

                    return (
                      <Link
                        key={idx}
                        href={sub.url}
                        className={`
                          flex items-center px-6 py-2 text-sm
                          gap-2
                          hover:bg-gray-700
                          ${isSubActive ? 'bg-gray-700' : ''}
                        `}
                      >
                        <span className="shrink-0">{sub.icon}</span>
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <form action="/auth/logout" method="post">
        <button
          type="submit"
          className={`w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center justify-center text-lg cursor-pointer`}
        >
          <span className="shrink-0">
            <LogOut />
          </span>
          <span
            className={`
              whitespace-nowrap overflow-hidden
              transition-all duration-500 ease-in-out
            `}
          >
            Thoát
          </span>
        </button>
      </form>
    </aside>
  );
};

export default Sidebar;
