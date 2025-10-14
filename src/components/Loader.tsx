import type React from "react"

interface LoaderProps {
  isLoading: boolean
}

export const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null

  // Dividir el título en letras individuales
  const title = "Sr. Robot".split("").map((char, index) => (
    <span
      key={index}
      className="inline-block animate-letter-bounce"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ))

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white/95 via-gray-100/90 to-gray-200/85 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/85 backdrop-blur-lg z-50 flex items-center justify-center transition-all duration-700">
      <div className="text-center relative">
        <div className="relative">
          <img 
            src="../assets/images/s-r.png" 
            alt="Logo" 
            className="w-24 h-24 mx-auto mb-5 animate-glow-scale drop-shadow-2xl"
          />
          <div className="absolute -inset-7 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin [animation-duration:0.9s]"></div>
          <div className="absolute -inset-9 border-2 border-red-400/10 border-t-red-500 rounded-full animate-spin [animation-duration:1.3s] [animation-direction:reverse]"></div>
          <div className="absolute -inset-10 rounded-full bg-red-500/8 animate-ping [animation-duration:2.8s]"></div>
          <div className="absolute -inset-2 w-5 h-5 bg-white/30 dark:bg-red-500/25 rounded-full animate-flare [animation-delay:0.6s]"></div>
          <div className="absolute -inset-2 w-5 h-5 bg-white/25 dark:bg-red-500/20 rounded-full animate-flare [animation-delay:1.2s] translate-x-10"></div>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight drop-shadow-md">
          {title}
        </h2>
        <p className="text-gray-500 dark:text-gray-200 text-lg font-semibold overflow-hidden">
          <span className="inline-block animate-typing [animation:typing_3s_steps(30)_infinite]">
            Cargando experiencia tecnológica...
          </span>
        </p>
        <div className="mt-6 w-72 h-2.5 bg-gray-200/30 dark:bg-gray-700/30 rounded-full overflow-hidden mx-auto shadow-inner">
          <div className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-[length:300%] animate-gradient rounded-full relative">
            <div className="absolute right-0 w-2 h-2 bg-white/70 dark:bg-red-400/70 rounded-full animate-spark"></div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes glow-scale {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            filter: brightness(1) drop-shadow(0 0 8px rgba(255, 0, 0, 0.3));
          }
          50% {
            transform: scale(1.15) rotate(5deg);
            filter: brightness(1.2) drop-shadow(0 0 12px rgba(255, 0, 0, 0.5));
          }
        }
        @keyframes letter-bounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-5px);
            opacity: 0.7;
          }
        }
        @keyframes typing {
          0% {
            width: 0;
          }
          50% {
            width: 100%;
          }
          100% {
            width: 0;
          }
        }
        @keyframes gradient {
          0% {
            background-position: 0%;
          }
          50% {
            background-position: 300%;
          }
          100% {
            background-position: 0%;
          }
        }
        @keyframes flare {
          0%, 100% {
            transform: scale(1) translate(0, 0);
            opacity: 0;
          }
          50% {
            transform: scale(1.4) translate(8px, -8px);
            opacity: 0.7;
          }
        }
        @keyframes spark {
          0%, 100% {
            transform: translateX(0);
            opacity: 0.4;
          }
          50% {
            transform: translateX(-8px);
            opacity: 0.9;
          }
        }

        .animate-glow-scale {
          animation: glow-scale 2.2s ease-in-out infinite;
        }
        .animate-letter-bounce {
          animation: letter-bounce 1.5s ease-in-out infinite;
        }
        .animate-typing {
          animation: typing 3s steps(30) infinite;
        }
        .animate-gradient {
          animation: gradient 2s ease-in-out infinite;
        }
        .animate-flare {
          animation: flare 3s ease-in-out infinite;
        }
        .animate-spark {
          animation: spark 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}