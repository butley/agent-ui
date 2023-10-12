//export { default, getServerSideProps } from './agent/home';
import { signIn } from "next-auth/react";
import Head from 'next/head';

interface ServiceCardProps {
    title: string;
    description: string;
}

const services: ServiceCardProps[] = [
    {
        title: "Dynamic Task Automation",
        description: "Your assistant can handle any task you assign, swiftly and efficiently. Whether it's organizing data, interacting with various online platforms, or even managing a software project, you don't need to worry about the technicalities - just tell the assistant what you need done."
    },
    {
        title: "Online Research Expert",
        description: "Need quick research? The assistant can scan the web, gather relevant information, and provide you with concise summaries."
    },
    {
        title: "Reliable Memory",
        description: "The assistant's impeccable memory ensures that important details and conversations are never forgotten. Share moments, memories, or vital business info, and access it anytime in the future."
    },
    {
        title: "Developer Assistance",
        description: "Though you might not understand code, our AI does. It can manage, modify, and maintain software projects, ensuring smooth operation of your digital assets."
    },
    {
        title: "API & Database Interactions",
        description: "Our AI can communicate and coordinate with various online platforms, databases, and services, ensuring seamless integration and functionality."
    },
    {
        title: "Smart Receptionists",
        description: "Create your personalized virtual receptionist. They can handle inquiries, manage schedules, and provide instant customer service, ensuring your clients are always satisfied."
    },
    {
        title: "Customizable Agents",
        description: "Every need is unique. Design and name multiple AI agents as per your requirements. Each will have its unique memory, ensuring specialized service."
    },
    {
        title: "Pay As You Go",
        description: "Experience the flexibility of our pricing. The more you interact, the more you pay, ensuring you only pay for what you use."
    }
];

type LayoutPageProps = {
    title?: string;
};

const LandingPage: React.FC<LayoutPageProps> = ({ title = "Butley" }) => {

    return (
        <main
            className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white`}
        >
            <div className="h-screen flex flex-col">
                <Head>
                    <title>{title}</title>
                </Head>
                <meta
                    name="viewport"
                    content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
                />


                {/* Navbar */}
                <div className="fixed w-full p-4 shadow-md bg-primary dark:bg-primary">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex space-x-4">
                            {/*<a href="#" className="text-gray-600 hover:text-gray-100">Services</a>
                            <a href="#" className="text-gray-600 hover:text-gray-100">Industries</a>*/}
                        </div>
                        <div className="flex space-x-4">
                            <button className="bg-secondary dark:bg-secondary hover:dark:bg-blue-100 shadow-md text-white px-4 py-2 rounded" onClick={() => signIn("google")}>Login</button>
                            <button className="border dark:bg-secondary hover:bg-accent shadow-md px-4 py-2 rounded">See Prices</button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto bg-primary dark:bg-primary p-4 text-black mt-20 text-center .dark ">
                    <div className="rounded shadow-md ">
                        <h1 className="text-4xl text-gray-600 font-bold mt-2 mb-10">How Butley powers your success:</h1>
                        <div className="grid pb-6 pl-10 pr-10 grid-cols-4 gap-8">
                            {services.map((service, index) => (
                                <ServiceCard key={index} title={service.title} description={service.description} />
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="h-screen p-4 bg-primary dark:bg-primary"></footer>
            </div>
        </main>
    );
}

export default LandingPage;

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description }) => {
    return (
        <div className="border mx-auto p-4 shadow-md rounded bg-white dark:bg-primary dark:text-gray-100">
            <div className="flex justify-center items-center h-16 w-16 mx-auto bg-gray-200 mb-4 rounded-full">
                {/* Placeholder for icon */}
            </div>
            <h3 className="text-gray-600 text-xl mb-2">{title}</h3>
            <p className="text-black">{description}</p>
            {/*<a href="#" className="text-blue-600 hover:underline mt-4 inline-block">Learn more</a>*/}
        </div>
    );
}
