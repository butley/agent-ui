import type { NextPage } from "next";
import Link from 'next/link';
import {useState} from "react";
import {signIn} from "next-auth/react";

const LoginPage: NextPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailPasswordLogin = async () => {
        const res = await fetch("/api/auth/callback/credentials", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            // Redirect or perform some action on successful login
        } else {
            // Handle error
        }
    };

    return (
        <div className="relative bg-darkslategray w-full h-[960px] overflow-hidden text-left text-[17.71px] text-gray font-poppins">
            <div className="absolute top-[55px] left-[204px] rounded-3xl bg-white shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] w-[1512px] h-[850.08px]">
                <div className="absolute top-[0px] right-[0px] w-[756px] h-[850.08px] overflow-hidden flex flex-col items-end justify-start py-[101.83309173583984px] px-[94.08491516113281px] box-border bg-cover bg-no-repeat bg-[top]">
                    <img
                        className="relative w-[566.72px] h-[566.72px] object-cover"
                        alt=""
                        src="/img/butley_big.png"
                    />
                </div>
                <div className="absolute top-[202.56px] left-[169.35px] w-[402.9px] h-[443.86px]">
                    <div className="absolute top-[333.17px] left-[0px] w-[402.9px] h-[26.57px]">
                        <div className="absolute top-[26.15px] left-[-0.35px] w-[403px] h-[90.44px]">
                            <button className="cursor-pointer p-0 bg-[transparent] hover:bg-primary absolute top-[11.49px] left-[0.35px] rounded-[17.71px] box-border w-[402.9px] h-[57.56px] flex flex-col items-center justify-center border-[1.1px] border-solid border-lavender"
                                    onClick={() => signIn('google')}>
                                <div className="w-[159.39px] h-[33.21px] flex flex-row items-center justify-start gap-[8.86px]">
                                    <img
                                        className="relative w-[33.21px] h-[33.21px] object-cover"
                                        alt=""
                                        src="/img/google-1.png"
                                    />
                                    <div className="relative text-[13.28px] text-gray text-left">
                                        <span className="font-poppins">{`Login with `} <b>Google</b></span>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <div className="absolute top-[0px] left-[0px] w-[402.9px] h-[27px]">
                            <div className="absolute top-[0px] left-[125.08px]">
                                <b>Login</b>
                                <span className="text-dimgray"> with Others</span>
                            </div>
                            <img
                                className="relative top-[12px] w-[402.9px] h-[1.11px]"
                                alt=""
                                src="/img/subtract.svg"
                            />
                        </div>
                    </div>
                    <div className="absolute top-[249.05px] left-[15.5px] w-[371.91px] h-[57.56px] overflow-hidden">
                        <Link href="/agent/create_account">
                            <button className="cursor-pointer [border:none] py-0 px-[14.389457702636719px] bg-darkslategray absolute top-[0px] left-[234.66px] rounded-[17.71px] w-[137.25px] h-[57.56px] flex flex-col items-start justify-center box-border">
                                <b className="relative text-[13.28px] font-poppins text-white text-left">
                                    Create Account
                                </b>
                            </button>
                        </Link>
                        <button className="cursor-pointer [border:none] hover:bg-accent p-0 bg-darkslategray absolute top-[0px] left-[0px] rounded-[17.71px] w-[137.25px] h-[57.56px]"
                                onClick={handleEmailPasswordLogin}>
                            <b className="absolute top-[18.82px] left-[33.21px] text-[13.28px] font-poppins text-white text-left">
                                Login Now
                            </b>
                        </button>
                    </div>
                    <input
                        className="[border:none] font-poppins text-[13.28px] bg-lightsalmon absolute top-[161.44px] left-[5.65px] rounded-[17.71px] w-[397px] h-[60px] flex flex-row items-center justify-start py-0 px-[19.92386245727539px] box-border"
                        placeholder="password" id={"password"} name={"password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                    />
                    <input
                        className="[border:none] font-poppins text-[13.28px] bg-lightsalmon absolute top-[87.44px] left-[5.53px] rounded-[17.71px] w-[397.37px] h-[57.56px] flex flex-row items-center justify-start py-0 px-[19.92386245727539px] box-border"
                        placeholder="email" id={"email"} name={"email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="text"
                    />
                    <div className="absolute top-[42.06px] left-[30.99px] text-dimgray">
                        Provide your credentials or use Google
                    </div>
                    <b className="absolute top-[0px] left-[149.43px] text-[33.21px] uppercase text-black">
                        Login
                    </b>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
