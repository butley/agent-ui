
import { signIn } from 'next-auth/react';

function LoginPage() {
    return (
        <>
            <div className="mx-auto flex w-[350px] flex-col space-y-10 pt-12 sm:w-[600px]">
                <div className="text-center text-3xl font-semibold text-white">
                    Not signed in
                </div>

                <br/>
                <button
                    className="flex h-12 w-full items-center justify-center rounded-lg border border-b-neutral-300 bg-neutral-100 text-sm font-semibold text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200"
                    onClick={() => signIn('google')}>Sign in
                </button>
            </div>
        </>
    );
}

export default LoginPage;
