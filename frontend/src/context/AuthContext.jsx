import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext({
    session: null,
    loading: true,
    user: null,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {}
});

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Get initial session
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) throw error;
                
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                }
            } catch (error) {
                if (mounted) {
                    setSession(null);
                    setUser(null);
                    setLoading(false);
                }
            }
        };

        initSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { data, error: null };
    };

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return { data, error: null };
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            setSession(null);
            setUser(null);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const UserAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('UserAuth must be used within an AuthContextProvider');
    }
    return context;
}