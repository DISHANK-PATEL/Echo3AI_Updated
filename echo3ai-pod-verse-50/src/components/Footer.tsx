
import React from 'react';
import { Github, Twitter, MessageSquare } from 'lucide-react';

const Footer = () => {
  const links = {
    product: [
      { name: "GitHub", href: "#", icon: Github },
      { name: "Documentation", href: "#" },
      { name: "Community Discord", href: "#", icon: MessageSquare }
    ],
    social: [
      { name: "Twitter", href: "#", icon: Twitter },
      { name: "GitHub", href: "#", icon: Github },
      { name: "Discord", href: "#", icon: MessageSquare }
    ]
  };

  return (
    <footer className="py-20 px-4 border-t border-gray-800 relative bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 hover:text-blue-400 transition-colors cursor-pointer">Echo3AI</h3>
            <p className="text-gray-300 leading-relaxed max-w-md">
              The future of decentralized podcasting, powered by AI and built on the Internet Computer Protocol. 
              Censorship-resistant, community-driven, and designed for creators.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {links.product.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2 hover:translate-x-1 transform"
                  >
                    {link.icon && <link.icon className="h-4 w-4" />}
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <div className="flex space-x-4">
              {links.social.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 transform-gpu hover:-translate-y-1 group"
                >
                  <social.icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 text-sm hover:text-gray-300 transition-colors">
            Built with React, Rust, ICP, IPFS, Whisper & Gemini/OpenAI
          </div>
          <div className="text-gray-400 text-sm hover:text-gray-300 transition-colors">
            © 2024 Echo3AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
