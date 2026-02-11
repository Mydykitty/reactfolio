import React from "react";
import type { AboutInfo } from "../types";

interface AboutProps {
  about: AboutInfo;
}

const About: React.FC<AboutProps> = ({ about }) => {
  return (
    <section className="py-8 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {about.avatar && (
          <img
            src={about.avatar}
            alt="头像"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
          />
        )}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          {about.bio}
        </p>
      </div>
    </section>
  );
};

export default About;
