import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { isLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your EduNext assistant. What are you looking for today? (Scholarships, Internships, or Courses?)", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState(null);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [profileData, setProfileData] = useState({});
  const loggedIn = isLoggedIn();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (loggedIn) {
      api.get('/profile').then(res => {
        if (res.data.profile) {
          setProfileData(res.data.profile);
        }
      }).catch(err => console.error(err));
    }
  }, [loggedIn]);

  const steps = [
    { field: "intent", question: "What are you looking for today? (Scholarships, Internships, or Courses?)" },
    { field: "start", question: "Great choice! To find the best matches, I need to know a bit about you. Shall we update your profile? (Yes/No)" },
    { field: "full_name", question: "What is your full name?" },
    { field: "dob", question: "What is your Date of Birth? (YYYY-MM-DD)" },
    { field: "course", question: "What course are you currently studying? (e.g., B.Tech, BSc, etc.)" },
    { field: "year_of_study", question: "Which year of study are you in? (e.g., 1, 2, 3, 4)" },
    { field: "income", question: "What is your annual family income? (in INR)" },
    { field: "caste", question: "What is your caste category? (General, OBC, SC, ST)" },
    { field: "tenth_percentage", question: "What was your 10th grade percentage? (0-100)" },
    { field: "twelfth_percentage", question: "What was your 12th grade percentage? (0-100)" },
    { field: "disability", question: "Do you have any disability? (Yes/No)" },
    { field: "done", question: "All set! I'm redirecting you to your matches now..." }
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate "typing" delay for realism
    setTimeout(async () => {
      try {
        await processInput(input);
      } catch (err) {
        setMessages(prev => [...prev, { text: "Sorry, I encountered an error. Please try again.", sender: "bot" }]);
      }
      setLoading(false);
    }, 800);
  };

  const processInput = async (text) => {
    const currentStepObj = steps[step];
    let nextStep = step + 1;
    let responseText = "";
    const lowerText = text.toLowerCase();
    let validationError = null;

    // VALIDATION LOGIC
    if (currentStepObj.field === "intent") {
      if (!lowerText.includes("scholarship") && !lowerText.includes("internship") && !lowerText.includes("course")) {
        validationError = "Please specify one: Scholarships, Internships, or Courses.";
      }
    } else if (currentStepObj.field === "start" || currentStepObj.field === "disability") {
      if (!lowerText.includes("yes") && !lowerText.includes("no") && !lowerText.includes("sure") && !lowerText.includes("ok")) {
        validationError = "Please answer with Yes or No.";
      }
    } else if (currentStepObj.field === "year_of_study") {
      const val = parseFloat(text);
      if (isNaN(val) || val < 1 || val > 10) {
        validationError = "Please enter a valid year (1-10).";
      }
    } else if (currentStepObj.field === "income") {
      const val = parseFloat(text.replace(/[^0-9.]/g, ''));
      if (isNaN(val) || val < 0) {
        validationError = "Please enter a valid income amount.";
      }
    } else if (currentStepObj.field === "dob") {
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(text)) {
        validationError = "Please enter date in YYYY-MM-DD format.";
      }
    } else if (currentStepObj.field === "tenth_percentage" || currentStepObj.field === "twelfth_percentage") {
      const val = parseFloat(text);
      if (isNaN(val) || val < 0 || val > 100) {
        validationError = "Please enter a valid percentage (0-100).";
      }
    }

    if (validationError) {
      setMessages(prev => [...prev, { text: validationError, sender: "bot" }]);
      return;
    }

    // PROCESSING logic same as before...
    if (currentStepObj.field === "intent") {
      if (lowerText.includes("internship")) {
        setIntent("internships");
        responseText = steps[nextStep].question;
      } else if (lowerText.includes("course")) {
        setIntent("courses");
        responseText = steps[nextStep].question;
      } else if (lowerText.includes("scholarship")) {
        setIntent("scholarships");
        responseText = steps[nextStep].question;
      }
    } else if (currentStepObj.field === "start") {
      if (lowerText.includes("yes") || lowerText.includes("sure") || lowerText.includes("ok")) {
        responseText = steps[nextStep].question;
      } else {
        responseText = `Okay! Redirecting you to ${intent} page directly.`;
        setTimeout(() => navigate(`/${intent}`, { state: { guestProfile: profileData } }), 2000);
        nextStep = step; // stop here
      }
    } else if (currentStepObj.field === "done") {
      responseText = `Profile updated! Taking you to ${intent}...`;
      setTimeout(() => navigate(`/${intent}`), 2000);
      nextStep = step;
    } else {
      let field = currentStepObj.field;
      let value = text;

      if (field === "year_of_study" || field === "income" || field === "tenth_percentage" || field === "twelfth_percentage") {
        value = parseFloat(text.replace(/[^0-9.]/g, ''));
      }
      if (field === "disability") {
        value = lowerText.includes("yes");
      }
      if (field === "dob") { field = "dob"; }

      const updatedProfile = { ...profileData, [field]: value };
      setProfileData(updatedProfile);

      if (loggedIn) {
        try { await api.put('/profile', updatedProfile); } catch (err) { console.error(err); }
      }

      if (nextStep < steps.length) {
        responseText = steps[nextStep].question;
      } else {
        responseText = `All done! Redirecting you to ${intent}...`;
        setTimeout(() => navigate(`/${intent}`, { state: { guestProfile: updatedProfile } }), 2000);
      }
    }

    setMessages(prev => [...prev, { text: responseText, sender: "bot" }]);
    setStep(nextStep);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white font-bold">
          AI
        </div>
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">EduNext Assistant</h3>
          <p className="text-indigo-100 text-xs">Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}>
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0 flex items-center justify-center text-white text-xs mr-2 mt-auto shadow-md">
                AI
              </div>
            )}
            <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-md text-sm leading-relaxed ${msg.sender === "user"
              ? "bg-indigo-600 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
              }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0 mr-2 mt-auto opacity-50"></div>
            <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1 items-center h-10">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce animation-delay-200"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce animation-delay-400"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your answer..."
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:translate-x-0.5 transition">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
