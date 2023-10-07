'use client'
import type {NextPage} from "next";
import React, {useEffect, useState} from "react";
import Link from 'next/link';
import {useRouter} from "next/router";
import toast, {Toaster} from "react-hot-toast";
import {MdOutlineClose} from "react-icons/md";
import {HiLightningBolt} from "react-icons/hi";
import {createUser, emailExists} from "@/components/agent/api";
import {UserEntity} from "@/types/agent/models";
import bcrypt from 'bcryptjs';

const notify = () =>
    toast.custom(
        (t) => (
            <div>
                <div className="iconWrapper">
                    <HiLightningBolt />
                </div>
                <div className="contentWrapper">
                    <h1>New version available</h1>
                    <p>
                        An improved version of VESSEL is now available, refresh to update.
                    </p>
                </div>
                <div className="closeIcon" onClick={() => toast.dismiss(t.id)}>
                    <MdOutlineClose />
                </div>
            </div>
        ),
        { id: "unique-notification", position: "top-center" }
    );

const CreateAccountPage: NextPage = () => {
    const router = useRouter();

    const [data, setData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        retype_password: '',
    });

    const registerUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!data.firstname || !data.email  || !data.lastname || !data.password || !data.retype_password) {
            toast.error('All fields are required');
            return;
        }
        if (data.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        if (data.password !== data.retype_password) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const response = await emailExists(data.email);
            toast.error('User already exists');
        } catch (error) {
            console.log("User not found. Clear to create");
        }

        const newUser: UserEntity = {
            email: data.email,
            firstName: data.firstname,
            lastName: data.lastname,
            password: bcrypt.hashSync(data.password, 8),
            provider: 'NONE',
            status: 'ACTIVE',
        };

        try {
            const createdUser = await createUser(newUser);
            await router.push("/agent/login")
        } catch (error) {
            // @ts-ignore
            toast.error(error.response.data.errorMessage)
        }

    }

    return (
        <div className="relative bg-darkslategray w-full h-[960px] overflow-hidden text-left text-[33.21px] text-black font-poppins">
            <div className="absolute top-[55px] left-[204px] rounded-3xl bg-white shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] w-[1512px] h-[850.08px]">
                <div className="absolute top-[0px] right-[0px] w-[756px] h-[850.08px] overflow-hidden flex flex-col items-end justify-start py-[101.83309173583984px] px-[94.08491516113281px] box-border bg-[url('/frame1@3x.png')] bg-cover bg-no-repeat bg-[top]">
                    <img
                        className="relative w-[566.72px] h-[566.72px] object-cover"
                        alt=""
                        src="/img/butley_big.png"
                    />
                </div>
                <form onSubmit={registerUser}>
                    <div className="absolute top-[102px] left-[29px] w-[685px] h-[709px]">
                        <div className="absolute top-[499px] left-[141px] w-[403px] h-[151px] overflow-hidden">
                            <button className="cursor-pointer p-0 bg-[transparent] absolute top-[87.49px] left-[0.35px] rounded-[17.71px] box-border w-[402.9px] h-[57.56px] flex flex-col items-center justify-center border-[1.1px] border-solid border-lavender">
                                <div className="w-[159.39px] h-[33.21px] flex flex-row items-center justify-start gap-[8.86px]">
                                    <img
                                        className="relative w-[33.21px] h-[33.21px] object-cover"
                                        alt=""
                                        src="/img/google-1.png"
                                    />
                                    <div className="relative text-[13.28px] text-gray text-left">
                                        <span className="font-poppins">{`Create with `}</span>
                                        <b className="font-poppins">Google</b>
                                    </div>
                                </div>
                            </button>
                            <button className="cursor-pointer [border:none] py-0 px-[14.389457702636719px] bg-darkslategray absolute top-[0px] left-[266px] rounded-[17.71px] w-[137.25px] h-[57.56px] flex flex-col items-center justify-center box-border">
                                <b className="relative text-[13.28px] font-poppins text-white text-left">
                                    Create
                                </b>
                            </button>
                            <Link href="/agent/login">
                                <button className="cursor-pointer [border:none] p-0 bg-darkslategray absolute top-[5px] left-[0px] rounded-[17.71px] w-[137.25px] h-[57.56px]">
                                    <b className="absolute top-[18.4px] left-[52.04px] text-[13.28px] font-poppins text-white text-left">
                                        Back
                                    </b>
                                </button>
                            </Link>
                        </div>
                        <input
                            className="[border:none] font-poppins text-[13.28px] bg-lightsalmon absolute top-[374px] left-[141px] rounded-[17.71px] w-[402.9px] h-[57.56px] flex flex-row items-center justify-start py-0 px-[19.92386245727539px] box-border"
                            name="retype_password"
                            id="retype_password"
                            placeholder="retype password"
                            onChange={(e) => setData({...data, retype_password: e.target.value})}
                            type="password"
                        />
                        <input
                            className="[border:none] font-poppins text-[13.28px] bg-lightsalmon absolute top-[298px] left-[141px] rounded-[17.71px] w-[402.9px] h-[57.56px] flex flex-row items-center justify-start py-0 px-[19.92386245727539px] box-border"
                            name="password"
                            id="password"
                            placeholder="password"
                            onChange={(e) => setData({...data, password: e.target.value})}
                            type="password"
                        />
                        <input
                            className="[border:none] font-poppins text-[13.28px] bg-lightsalmon absolute top-[213px] left-[141px] rounded-[17.71px] w-[403px] h-[59px] flex flex-row items-center justify-start py-0 px-[19.92386245727539px] box-border"
                            name="email"
                            id="email"
                            placeholder="email"
                            onChange={(e) => setData({...data, email: e.target.value})}
                            type="email"
                        />
                        <input
                            className="[border:none] font-poppins text-[13.28px] bg-lightsalmon absolute top-[132px] left-[99px] rounded-[17.71px] w-[486px] h-[55px] flex flex-row items-center justify-start py-0 px-[19.92386245727539px] box-border"
                            name="lastname"
                            id="lastname"
                            placeholder="Lastname"
                            onChange={(e) => setData({...data, lastname: e.target.value})}
                            type="text"
                        />
                        <input
                            className="[border:none] font-poppins text-[13.28px] bg-lightsalmon absolute top-[62px] left-[99px] rounded-[17.71px] w-[486px] h-[52px] flex flex-row items-center justify-start py-0 px-[19.92386245727539px] box-border"
                            name="firstname"
                            id="firstname"
                            placeholder="Firstname"
                            onChange={(e) => setData({...data, firstname: e.target.value})}
                            type="text"
                        />
                        <b className="absolute top-[0px] left-[205px] uppercase">
                            Create Account
                        </b>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAccountPage;
