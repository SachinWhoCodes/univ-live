import { motion } from "framer-motion";
import { Linkedin, ExternalLink } from "lucide-react";

const teamMembers = [
  {
    name: "Kushagra Sharma",
    role: "Founder",
    avatar: "KS",
    linkedin: "#",
    highlight: "",
    gradient: "from-blue-500 to-primary",
  },
  {
    name: "Anurag Patidar",
    role: "Economics Expert",
    avatar: "AP",
    linkedin: "#",
    highlight: "200/200 in Economics",
    gradient: "from-primary to-accent",
  },
  {
    name: "Kushal Sharma",
    role: "English Expert",
    avatar: "KS",
    linkedin: "#",
    highlight: "200/200 in English",
    gradient: "from-accent to-purple-600",
  },
  {
    name: "Krishna Gupta",
    role: "SBSC",
    avatar: "KG",
    linkedin: "#",
    highlight: "",
    gradient: "from-purple-600 to-pink-500",
  },
  {
    name: "Mishty Jain",
    role: "Lady Shri Ram",
    avatar: "MJ",
    linkedin: "#",
    highlight: "",
    gradient: "from-pink-500 to-orange-500",
  },
];

export function TeamSection() {
  return (
    <section className="section-padding section-5">
      <div className="container-main">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Our Team
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Meet Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Team</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            The experts behind Univ.live, committed to transforming CUET preparation.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="bg-card rounded-2xl p-6 border border-border shadow-soft text-center hover-lift group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Avatar */}
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <span className="text-2xl font-bold text-white">{member.avatar}</span>
              </div>
              
              {/* Name */}
              <h3 className="font-bold text-lg mb-1">{member.name}</h3>
              
              {/* Role */}
              <p className="text-muted-foreground text-sm mb-3">{member.role}</p>
              
              {/* Highlight */}
              {member.highlight && (
                <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-xs font-semibold rounded-full mb-4 border border-primary/20">
                  {member.highlight}
                </span>
              )}
              
              {/* LinkedIn */}
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white transition-all duration-300 group/link"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
