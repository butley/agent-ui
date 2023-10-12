import {useState} from 'react';
import {PortalUser} from "@/types/agent/models";
import {signOut} from "next-auth/react";
import {useTranslation} from "next-i18next";


export function UserCard({user}: { user: PortalUser }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { t } = useTranslation('chat');

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = async () => {
        await signOut()
    }

    if (!user) {
        return null; // or return a loader, placeholder, etc.
    }

    return (
        <div className="relative text-left top-2 flex items-center" onClick={toggleDropdown}>
            <button
                className="text-sm focus:outline-none mr-2 hover:text-green-900:">
                {user.firstName}
            </button>
            <img
                className="h-8 w-8 object-cover rounded-full"
                src={user.picture}
                alt={`${user.firstName}'s profile`}
            />
            {dropdownOpen && (
                <div
                    className="absolute bg-[#202123] z-auto right-0 top-full w-48 py-1 rounded-md border border-white p-3 text-[12.5px] leading-3 text-white focus:outline-none">
                    <a href="/settings"
                        className="block px-4 py-2 text-sm hover:bg-gray-800 focus:outline-none">
                        {t('Dashboard')}
                    </a>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 focus:outline-none"
                        onClick={handleLogout} >
                        {t('Logout')}
                    </button>
                </div>
            )}
        </div>
    );
}
