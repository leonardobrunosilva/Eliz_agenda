import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = "" }) => {
    return (
        <div className={`flex flex-col w-full min-h-full pb-24 ${className}`}>
            {children}
        </div>
    );
};

export default Layout;
