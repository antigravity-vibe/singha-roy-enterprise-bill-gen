import { useState } from "react";
import { Trash2, EllipsisVertical } from "lucide-react";
import { PiGithubLogoDuotone } from "react-icons/pi";
import { AiOutlineImport } from "react-icons/ai";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { BsClipboard2Check } from "react-icons/bs";
import { packageJSON } from "@/utils/packageJSON";
import SinghaRoyEnterpriseLogo from "@/assets/singhaRoyEnterpriseLogo.svg?react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    onExportState: () => Promise<void>;
    onImportState: () => Promise<void>;
    onClearForm: () => void;
    clearArmed: boolean;
}

export function Header({
    isDarkMode,
    toggleTheme,
    onExportState,
    onImportState,
    onClearForm,
    clearArmed,
}: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 right-0 left-0 z-50 flex h-16 w-full items-center justify-between bg-white/90 px-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-md transition-colors duration-300 select-none sm:px-6 dark:bg-slate-950/90 dark:ring-slate-100/10">
            <div className="flex items-center gap-3">
                <SinghaRoyEnterpriseLogo className="h-10 w-10 shrink-0 drop-shadow-sm sm:h-11 sm:w-11" />
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 transition-colors duration-300 sm:text-xl lg:text-2xl dark:text-slate-100">
                    SINGHA ROY ENTERPRISE INVOICE GENERATOR
                </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Version */}
                <span className="hidden text-xs font-medium text-slate-400 sm:inline dark:text-slate-500">
                    v{packageJSON.version}
                </span>
                <div className="mx-0.5 h-5 w-px bg-slate-200 dark:bg-slate-700" />

                {/* GitHub Link */}
                {packageJSON.repository?.url && (
                    <a
                        href={packageJSON.repository.url.replace(/\.git$/, "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        title="GitHub Repository"
                    >
                        <PiGithubLogoDuotone className="h-5 w-5" />
                    </a>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    title="Toggle Theme"
                >
                    {isDarkMode ? <MdLightMode className="h-5 w-5" /> : <MdDarkMode className="h-5 w-5" />}
                </button>

                <div className="mx-0.5 h-5 w-px bg-slate-200 dark:bg-slate-700" />

                {/* 3-Dot Options Menu */}
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            title="More options"
                            id="more-options-btn"
                        >
                            <EllipsisVertical className="h-5 w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8} className="w-52">
                        <DropdownMenuItem
                            onClick={() => {
                                onExportState();
                            }}
                            className="cursor-pointer gap-3 py-2"
                            id="export-state-btn"
                        >
                            <BsClipboard2Check className="h-4 w-4 shrink-0" />
                            <span>Export State</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                onImportState();
                            }}
                            className="cursor-pointer gap-3 py-2"
                            id="import-state-btn"
                        >
                            <AiOutlineImport className="h-4 w-4 shrink-0" />
                            <span>Import State</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={(e) => {
                                if (!clearArmed) {
                                    // Prevent menu from closing on the first click (arm step)
                                    e.preventDefault();
                                }
                                onClearForm();
                            }}
                            className={`cursor-pointer gap-3 py-2 ${
                                clearArmed
                                    ? "bg-red-100 text-red-700 focus:bg-red-200 focus:text-red-700 dark:bg-red-900/40 dark:text-red-300 dark:focus:bg-red-900/70 dark:focus:text-red-300"
                                    : ""
                            }`}
                            id="clear-form-btn"
                        >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            <span>{clearArmed ? "Click again to confirm" : "Clear Form"}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
