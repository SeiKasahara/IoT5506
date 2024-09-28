import TopBar from "../components/ui/dashboard/topbar";
import SidebarSetting from "../components/ui/settings/sidebarSetting";
import { useState } from "react";
import Account from "../components/ui/settings/account";
import Message from "../components/ui/settings/message";

const Setting = () => {
    const [activePage, setActivePage] = useState("Account");

    return (
        <div className="w-full flex flex-col">
            {/* TopBar */}
            <TopBar fullWidth={true} tag={"setting"} />

            {/* Main Content */}
            <div className="flex justify-center items-start flex-1">
                {/* Sidebar and Content Wrapper */}
                <div className="flex justify-between mt-10 space-x-8">
                    {/* Sidebar */}
                    <div>
                        <SidebarSetting activePage={activePage} setActivePage={setActivePage} />
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-lg shadow-lg">
                        {activePage === 'Account' && <Account />}
                        {activePage === 'Message' && <Message />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Setting;
