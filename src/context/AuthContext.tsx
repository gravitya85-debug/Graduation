import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { AuthContextType, UserRole } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<UserRole | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                setLoading(true);
                fetchUserRole(session.user.id);
            } else {
                setRole(null);
                setUserName(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role, name, phone')
                .eq('id', userId)
                .single();

            if (data && !error) {
                setRole(data.role as UserRole);
                setUserName(data.name);

                if (data.role === 'graduate') {
                    const { data: gradData } = await supabase
                        .from('graduates')
                        .select('specialization, graduation_year')
                        .eq('user_id', userId)
                        .single();

                    const complete = !!(
                        data.name?.trim() &&
                        data.phone?.trim() &&
                        gradData?.specialization?.trim() &&
                        gradData?.graduation_year
                    );
                    setIsProfileComplete(complete);
                } else if (data.role === 'company') {
                    const { data: compData } = await supabase
                        .from('companies')
                        .select('description, industry, location')
                        .eq('user_id', userId)
                        .single();

                    const complete = !!(
                        data.name?.trim() &&
                        data.phone?.trim() &&
                        compData?.description?.trim() &&
                        compData?.industry?.trim() &&
                        compData?.location?.trim()
                    );
                    setIsProfileComplete(complete);
                } else if (data.role === 'doctor') {
                    const { data: docData } = await supabase
                        .from('doctors')
                        .select('specialization, degree, department')
                        .eq('user_id', userId)
                        .single();

                    const complete = !!(
                        data.name?.trim() &&
                        data.phone?.trim() &&
                        docData?.specialization?.trim() &&
                        docData?.degree?.trim() &&
                        docData?.department?.trim()
                    );
                    setIsProfileComplete(complete);
                } else {
                    setIsProfileComplete(true);
                }
            } else {
                console.error("Error fetching user role:", error);
                setRole(null);
                setUserName(null);
            }
        } catch (err) {
            console.error("Unexpected error fetching user role:", err);
            setRole(null);
            setUserName(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = () => {
        if (user) fetchUserRole(user.id);
    };

    const login = async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const register = async (email: string, password: string, userData: { name: string, role: UserRole }) => {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) return { data, error };

        if (data?.user) {
            // Create user record in our users table
            const { error: dbError } = await supabase.from('users').insert({
                id: data.user.id,
                email,
                name: userData.name,
                role: userData.role
            });

            // If graduate, stub the graduate record
            if (userData.role === 'graduate' && !dbError) {
                await supabase.from('graduates').insert({ user_id: data.user.id });
            }

            // If company, stub the company record
            if (userData.role === 'company' && !dbError) {
                await supabase.from('companies').insert({ user_id: data.user.id });
            }

            // If doctor, stub the doctor record
            if (userData.role === 'doctor' && !dbError) {
                await supabase.from('doctors').insert({ user_id: data.user.id });
            }

            return { data, error: dbError };
        }
        return { data, error };
    };

    const deleteAccount = async () => {
        if (!user) return;
        const userId = user.id;

        // Delete role-specific data first
        if (role === 'graduate') {
            await supabase.from('job_applications').delete().eq('user_id', userId);
            await supabase.from('course_enrollments').delete().eq('user_id', userId);
            await supabase.from('course_reviews').delete().eq('user_id', userId);
            await supabase.from('postgrad_applications').delete().eq('user_id', userId);
            await supabase.from('workshop_registrations').delete().eq('user_id', userId);
            await supabase.from('certificates').delete().eq('user_id', userId);
            await supabase.from('graduates').delete().eq('user_id', userId);
        } else if (role === 'company') {
            await supabase.from('jobs').delete().eq('posted_by', userId);
            await supabase.from('companies').delete().eq('user_id', userId);
        } else if (role === 'doctor') {
            await supabase.from('doctors').delete().eq('user_id', userId);
        }

        // Delete notifications and payments
        await supabase.from('notifications').delete().eq('user_id', userId);
        await supabase.from('payments').delete().eq('user_id', userId);

        // Delete user record
        await supabase.from('users').delete().eq('id', userId);

        // Sign out
        setRole(null);
        setUserName(null);
        await supabase.auth.signOut();
    };

    const logout = async () => {
        setRole(null);
        setUserName(null);
        return await supabase.auth.signOut();
    };

    const value = useMemo(() => ({
        session,
        user,
        role,
        userName,
        isProfileComplete,
        loading,
        login,
        register,
        logout,
        deleteAccount,
        refreshProfile
    }), [session, user, role, userName, isProfileComplete, loading]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
