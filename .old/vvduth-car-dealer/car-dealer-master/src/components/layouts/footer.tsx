import { routes } from "@/config/routes";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SiInstagram , SiFacebook, SiX, SiYoutube } from "@icons-pack/react-simple-icons";
import NewsLetterForm from "./NewsLetterForm";
const socialLinks = [
  { id: 1, link: "https://facebook.com",
    icon: <SiFacebook size={24} />
   },
  { id: 2, link: "https://twitter.com",
    icon: <SiX size={24} />
   },
  { id: 3, link: "https://instagram.com",
    icon: <SiInstagram size={24} />
   },
  
  { id: 5, link: "https://youtube.com",
    icon: <SiYoutube size={24} />
   },
];
const navLinks = [
  { id: 1, href: routes.home, label: "Home" },
  { id: 2, href: routes.inventory, label: "Inventory" },
];
const PublicFooter = () => {
  return (
    <footer className="bg-gray-100 px-8 lg:px-0 py-8">
			<div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="flex flex-col space-x-2 gap-y-2">
           <h1 className="text-2xl font-bold text-primary mt-2">Meat Motors</h1>
					<Link className="flex items-center" href={routes.home}>
						<Image
							width={300}
							height={100}
							alt="logo"
							className="h-8 relative"
							src="/logo.svg"
						/>
           
					</Link>
					<div className="flex space-x-4">
						{socialLinks.map((link) => {
							return (
								<Link href={link.link} key={link.id}>
									{link.icon}
								</Link>
							);
						})}
					</div>
				</div>

				<ul className="space-y-1">
					{navLinks.map((link) => (
						<li key={link.id}>
							<Link
								href={link.href}
								className="text-foreground hover:text-primary"
							>
								{link.label}
							</Link>
						</li>
					))}
					<li>
						<Link
							href={routes.signIn}
							className="text-foreground hover:text-primary"
						>
							Admin
						</Link>
					</li>
					

				</ul>

				<NewsLetterForm />
			</div>
			<div className="container mx-auto mt-8 text-center text-gray-700">
				<h4 className="text-lg font-bold text-primary">The Real Talk</h4>
				<p>(yeah we pay taxes, unlike some people)</p>
				<p>
					Meat Motors ain't authorized by nobody - we just sell cars and mind our business 💯
				</p>
			</div>
		</footer>
  );
};

export default PublicFooter;
