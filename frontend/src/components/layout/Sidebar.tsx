'use client';
import React, { useEffect, useState } from 'react';
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
        trashCountKey: 'notes',
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
        trashCountKey: 'products',
      },
    ],
  },
  {
    label: 'Đơn hàng',
    url: '/admin/orders',
    icon: <ShoppingBagIcon />,
  },
  {
    label: 'Danh sách thành viên',
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [trashCounts, setTrashCounts] = useState<Record<string, number>>({});
  const activeSlugs = ['edit', 'create'];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [notesRes, productsRes] = await Promise.all([
          fetch('/api/admin/notes/trash/count', { credentials: 'include' }),
          fetch('/api/admin/products/trash/count', { credentials: 'include' }),
        ]);
        const [notesData, productsData] = await Promise.all([
          notesRes.json(),
          productsRes.json(),
        ]);
        setTrashCounts({
          notes: notesData.total || 0,
          products: productsData.total || 0,
        });
      } catch {
        // silent
      }
    };
    fetchCounts();

    window.addEventListener('trash-updated', fetchCounts);
    return () => window.removeEventListener('trash-updated', fetchCounts);
  }, [pathName]);

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
                        {sub.trashCountKey &&
                          trashCounts[sub.trashCountKey] > 0 && (
                            <span className=" bg-red-500 text-white text-xs rounded-full px-0.5 py-0.5 min-w-[20px] text-center">
                              {trashCounts[sub.trashCountKey]}
                            </span>
                          )}
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
