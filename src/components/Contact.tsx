import React from "react";
import type { ContactInfo } from "../types";

interface ContactProps {
  contact: ContactInfo;
}

const Contact: React.FC<ContactProps> = ({ contact }) => {
  return (
    <section className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        联系我
      </h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-gray-700 dark:text-gray-300">📧</span>
          <span className="text-gray-600 dark:text-gray-400">
            {contact.email}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-700 dark:text-gray-300">💻</span>
          <a
            href={contact.github}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            GitHub
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-700 dark:text-gray-300">👔</span>
          <a
            href={contact.linkedin}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
