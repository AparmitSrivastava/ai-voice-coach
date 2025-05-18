'use client'

import React, { Suspense } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import AuthProvider from './AuthProvider';

const Provider = ({ children }) => {
    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    return (
        <div>
             <Suspense fallback={<div>Loading user data...</div>}>
            <ConvexProvider client={convex}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ConvexProvider>
        </Suspense>
        </div>
    )
}

export default Provider

// making provider.jsx separatley to keep the provider on the client side and the layout.js on the server side