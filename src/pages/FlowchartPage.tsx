import gsap from 'gsap';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bot, Briefcase, BedDouble, Computer, FileText, ShieldCheck, Users, Lightbulb, Database, Target, RefreshCw, Clock, Shield } from 'lucide-react'; // Added Shield
import Navbar from '../components/Navbar'; // Corrected import path

// --- Data and Types ---

// Define additional icons first
const Search = Target; // For search operations
const CheckCircle = Lightbulb; // For confirmation/success operations

// Define interface for workflow steps to ensure type safety
interface WorkflowStep {
  title: string;
  position: { row: number; col: number };
  icon?: React.ElementType;
  variant: WorkflowStepVariant; // Ensure variant is properly typed
}

// Define WorkflowStepVariant type to ensure type safety
type WorkflowStepVariant = 'input' | 'process' | 'database' | 'output' | 'verify' | 'search' | 'action';

// --- Data for Dynamic Workflow Chart ---
const serviceWorkflows = [
  {
    name: "HRMS",
    icon: Briefcase,
    color: "#7b68ee", // Main Xpectrum purple
    roles: [
      { title: "Recruiting Specialist", icon: Users },
      { title: "Onboarding Assistant", icon: FileText },
      { title: "Benefits Coordinator", icon: ShieldCheck },
      { title: "HR Analyst", icon: Lightbulb }
    ],
    chatExample: {
      user: "How do I enroll in the new healthcare plan?",
      bot: "Hi [Name], I've found the enrollment form and pre-filled some details for you. Please review and submit."
    },
    // Custom workflow steps for HRMS with proper typing
    workflowSteps: [
      { title: "Parse Request", position: { row: 1, col: 1 }, icon: Computer, variant: "input" as WorkflowStepVariant },
      { title: "Access HR DB", position: { row: 1, col: 2 }, icon: Database, variant: "database" as WorkflowStepVariant },
      { title: "Generate Form", position: { row: 1, col: 3 }, icon: FileText, variant: "output" as WorkflowStepVariant },
      { title: "Check Policy", position: { row: 2, col: 2 }, icon: ShieldCheck, variant: "verify" as WorkflowStepVariant },
      { title: "Find Template", position: { row: 2, col: 1 }, icon: Search, variant: "search" as WorkflowStepVariant },
      { title: "Send Details", position: { row: 2, col: 3 }, icon: RefreshCw, variant: "action" as WorkflowStepVariant }
    ] as WorkflowStep[]
  },
  {
    name: "Insurance",
    icon: ShieldCheck,
    color: "#6366f1", // Indigo color
    roles: [
      { title: "Claims Adjuster", icon: FileText },
      { title: "Underwriting Asst.", icon: Computer },
      { title: "Policy Advisor", icon: Users },
      { title: "Fraud Detection", icon: Shield } // Use Shield icon
    ],
    chatExample: {
      user: "I need to file a claim for a minor car accident.",
      bot: "Okay, I can start the claims process. Please provide the date, location, and a brief description of the incident."
    },
    // Custom workflow steps for Insurance
    workflowSteps: [
      { title: "Classify Claim", position: { row: 1, col: 1 }, icon: FileText, variant: "input" as WorkflowStepVariant },
      { title: "Run Analysis", position: { row: 1, col: 2 }, icon: Lightbulb, variant: "process" as WorkflowStepVariant },
      { title: "Check Coverage", position: { row: 1, col: 3 }, icon: ShieldCheck, variant: "verify" as WorkflowStepVariant },
      { title: "Extract Details", position: { row: 2, col: 2 }, icon: Computer, variant: "database" as WorkflowStepVariant },
      { title: "Verify History", position: { row: 2, col: 1 }, icon: Clock, variant: "search" as WorkflowStepVariant },
      { title: "Generate Report", position: { row: 2, col: 3 }, icon: FileText, variant: "output" as WorkflowStepVariant }
    ] as WorkflowStep[]
  },
  {
    name: "Hospitality",
    icon: BedDouble,
    color: "#ec4899", // Pink color
    roles: [
      { title: "Booking Agent", icon: Computer },
      { title: "Guest Concierge", icon: Users },
      { title: "Event Planner", icon: FileText },
      { title: "Service Optimizer", icon: Lightbulb }
    ],
    chatExample: {
      user: "I'd like to request a late checkout for room 502.",
      bot: "Certainly! I've checked availability and can extend your checkout time to 1 PM. Enjoy your stay!"
    },
    // Custom workflow steps for Hospitality
    workflowSteps: [
      { title: "Identify Guest", position: { row: 1, col: 1 }, icon: Users, variant: "input" as WorkflowStepVariant },
      { title: "Check System", position: { row: 1, col: 2 }, icon: Computer, variant: "database" as WorkflowStepVariant },
      { title: "Verify Options", position: { row: 1, col: 3 }, icon: ShieldCheck, variant: "verify" as WorkflowStepVariant },
      { title: "Update Record", position: { row: 2, col: 2 }, icon: RefreshCw, variant: "process" as WorkflowStepVariant },
      { title: "Check Schedule", position: { row: 2, col: 1 }, icon: Clock, variant: "search" as WorkflowStepVariant },
      { title: "Confirm Request", position: { row: 2, col: 3 }, icon: CheckCircle, variant: "output" as WorkflowStepVariant }
    ] as WorkflowStep[]
  }
];

// --- Helper Components ---

type IconType = React.ElementType;

interface WorkflowBlockProps {
  title: string;
  icon?: IconType;
  color?: 'primary' | 'dark' | 'inactive';
  className?: string;
  IconComponent?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  is3D?: boolean;
  id?: string;
  variant?: WorkflowStepVariant;
}

const WorkflowBlock: React.FC<WorkflowBlockProps> = ({
  title,
  icon: Icon = Bot,
  color = 'dark',
  className = '',
  IconComponent,
  onClick,
  isSelected,
  is3D = true,
  id,
  variant,
}) => {
  const DisplayIcon = IconComponent || <Icon size={22} className="text-gray-900" />;

  const getBgColor = () => {
    if (color === 'primary' || isSelected) return 'bg-xpectrum-purple';
    if (color === 'dark') return 'bg-gray-100';
    return 'bg-gray-100';
  };

  const getTextColor = () => {
    if (color === 'primary' || isSelected) return 'text-white';
    return 'text-gray-700';
  };

  const getShadowStyle = () => {
    if (!is3D) return '';
    if (color === 'primary' || isSelected)
      return 'shadow-lg shadow-xpectrum-purple/25';
    return 'shadow-md shadow-gray-300/60';
  };

  const get3DStyle = () => {
    if (!is3D) return '';
    if (color === 'primary' || isSelected)
      return 'border-b-3 border-r-3 border-xpectrum-darkpurple';
    return 'border-b-2 border-r-2 border-gray-300';
  };

  const getVariantStyle = () => {
    if (!variant) return '';
    switch (variant) {
      case 'input': return 'border-l-4 border-blue-400';
      case 'process': return 'border-l-4 border-purple-400';
      case 'database': return 'border-l-4 border-green-400';
      case 'output': return 'border-l-4 border-orange-400';
      case 'verify': return 'border-l-4 border-red-400';
      case 'search': return 'border-l-4 border-yellow-400';
      case 'action': return 'border-l-4 border-indigo-400';
      default: return '';
    }
  };

  const getIconBgColor = () => {
    if (!variant) return 'bg-white/30';
    switch (variant) {
      case 'input': return 'bg-blue-100';
      case 'process': return 'bg-purple-100';
      case 'database': return 'bg-green-100';
      case 'output': return 'bg-orange-100';
      case 'verify': return 'bg-red-100';
      case 'search': return 'bg-yellow-100';
      case 'action': return 'bg-indigo-100';
      default: return 'bg-white/30';
    }
  };

  const cursorStyle = onClick ? 'cursor-pointer' : '';

  return (
    <div
      id={id}
      className={`relative p-3 rounded-lg ${getBgColor()} ${getTextColor()} ${cursorStyle} ${getShadowStyle()} ${get3DStyle()} ${getVariantStyle()} ${className} transition-colors duration-300 flex flex-col justify-between text-center w-[100px] h-[100px] items-center opacity-0 scale-90`}
      style={{ transformStyle: 'preserve-3d' }}
      onClick={onClick}
    >
      <div className={`w-10 h-10 ${getIconBgColor()} rounded-lg flex items-center justify-center mx-auto mb-2 ${getTextColor() === 'text-white' ? 'text-gray-700' : 'text-gray-900'}`}>
        {DisplayIcon}
      </div>
      <span className="font-medium text-[14px] text-center leading-tight">{title}</span>
    </div>
  );
};


interface ChatExampleProps {
  userMessage: string;
  botMessage: string;
  serviceColor?: string;
  id?: string;
  showBotResponse?: boolean;
}

const ChatExample: React.FC<ChatExampleProps> = ({ 
  userMessage, 
  botMessage, 
  serviceColor = 'bg-xpectrum-purple', 
  id, 
  showBotResponse = true
}) => {
  const isDynamicColor = serviceColor && !serviceColor.startsWith('bg-');
  const dynamicBgStyle = isDynamicColor ? { backgroundColor: serviceColor } : {};
  const staticBgClass = !isDynamicColor ? serviceColor : 'bg-xpectrum-purple';

  const [displayedBotMessage, setDisplayedBotMessage] = useState('');
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval when props change
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    if (showBotResponse) {
      setDisplayedBotMessage(''); // Reset message when starting to show
      let index = 0;
      typingIntervalRef.current = setInterval(() => {
        setDisplayedBotMessage((prev) => prev + botMessage.charAt(index));
        index++;
        if (index >= botMessage.length) {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
        }
      }, 50); // Adjust typing speed (milliseconds per character)
    } else {
      setDisplayedBotMessage(''); // Clear message if not shown
    }

    // Cleanup function to clear interval on unmount or prop change
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [botMessage, showBotResponse]); // Rerun effect if botMessage or showBotResponse changes

  return (
  <div
    id={id}
    className="bg-white rounded-xl shadow-sm p-4 w-72 border border-gray-100 flex flex-col opacity-0 scale-90"
    style={{ height: '260px' }}
  >
    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
      <div className="flex items-center">
        <div
           className={`w-7 h-7 rounded-full ${staticBgClass} flex items-center justify-center`}
           style={dynamicBgStyle}
         >
          <Bot size={16} className="text-white" />
        </div>
        <span className="text-gray-700 font-medium ml-2 text-[14px]">Assistant</span>
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
      </div>
    </div>

    <div className="space-y-3 flex-grow overflow-y-auto">
      <div className="flex justify-end mb-2">
        <div className="bg-gray-100 rounded-t-lg rounded-bl-lg px-3 py-2 max-w-[85%]">
          <p className="text-[14px] text-gray-700">{userMessage}</p>
        </div>
      </div>

      {showBotResponse && (
        <div className="flex justify-start items-start">
          <div
             className={`w-6 h-6 rounded-full ${staticBgClass} flex items-center justify-center mr-2`}
             style={dynamicBgStyle}
           >
            <Bot size={14} className="text-white" />
          </div>
          <div
             className={`${staticBgClass} rounded-t-lg rounded-br-lg px-3 py-2 max-w-[85%]`}
             style={dynamicBgStyle}
           >
            <p className="text-[14px] text-white">{displayedBotMessage}</p>
          </div>
        </div>
      )}
    </div>
  </div>
)};


interface ConnectionProps {
  from: string;
  to: string;
  path?: string;
  serviceColor?: string;
}

const Connection: React.FC<ConnectionProps> = ({ from, to, path, serviceColor = '#7b68ee' }) => {
  const safePath = path || 'M0,0 L0,0';
  const pathId = `path-${from}-${to}`;

  if (!path || path === 'M NaN,NaN C NaN,NaN NaN,NaN NaN,NaN') {
      return null;
  }

  return (
    <g>
      <path
        d={safePath}
        stroke="#e5e7eb"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        id={pathId}
        d={safePath}
        stroke={serviceColor}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
            opacity: 0,
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
        }}
      />
    </g>
  );
};


// --- Helper Function ---
interface Position {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

function calculateSmoothCurvePath(startPos: Position | null, endPos: Position | null, curveOffset = 50): string {
  if (!startPos || !endPos) return '';

  const startX = startPos.x + (startPos.width ? startPos.width / 2 : 50);
  const startY = startPos.y + (startPos.height ? startPos.height / 2 : 50);
  const endX = endPos.x + (endPos.width ? endPos.width / 2 : 50);
  const endY = endPos.y + (endPos.height ? endPos.height / 2 : 50);

  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  let cx1, cy1, cx2, cy2;
  const isHorizontal = Math.abs(dx) > Math.abs(dy);
  const isLeftToRight = dx > 0;

  if (isHorizontal) {
    const controlPointOffset = Math.min(Math.abs(dx) * 0.5, distance * 0.3);
    if (isLeftToRight) {
      cx1 = startX + controlPointOffset; cy1 = startY;
      cx2 = endX - controlPointOffset; cy2 = endY;
    } else {
      cx1 = startX - controlPointOffset; cy1 = startY;
      cx2 = endX + controlPointOffset; cy2 = endY;
    }
  } else {
    const controlPointOffset = Math.min(Math.abs(dy) * 0.5, distance * 0.3);
    cx1 = startX; cy1 = startY + (dy > 0 ? controlPointOffset : -controlPointOffset);
    cx2 = endX; cy2 = endY + (dy > 0 ? -controlPointOffset : controlPointOffset);
  }

  return `M ${startX},${startY} C ${cx1},${cy1} ${cx2},${cy2} ${endX},${endY}`;
}


// --- FlowchartPage Component ---

const FlowchartPage: React.FC = () => {
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number | null>(null);
  const [elementPositions, setElementPositions] = useState<Record<string, Position>>({});
  const [showDebug, setShowDebug] = useState(false);
  const [isBotResponseVisible, setIsBotResponseVisible] = useState(false);
  const workflowChartContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const calculationRetryRef = useRef<number>(0);
  const maxCalculationRetries = 5;

  const currentWorkflow = serviceWorkflows[selectedServiceIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    setTimeout(() => {
      calculatePositions();
    }, 300);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentWorkflow.name]);

  const calculatePositions = useCallback(() => {
    console.log("Calculating positions...");
    if (!workflowChartContainerRef.current) {
      console.warn("Workflow chart container ref not available");
      return;
    }

    let calculationPossible = true;
    const positions: Record<string, Position> = {};
    const containerRect = workflowChartContainerRef.current.getBoundingClientRect();

    const getElementPosition = (id: string): Position | null => {
      const element = document.getElementById(id);
      if (!element) {
        return null;
      }
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      };
    };

    currentWorkflow.roles.forEach((_, i) => {
      const roleId = `${currentWorkflow.name}-role-${i}`;
      const position = getElementPosition(roleId);
      if (position) positions[roleId] = position;
      else calculationPossible = false;
    });

    currentWorkflow.workflowSteps.forEach((_, i) => {
      const stepId = `${currentWorkflow.name}-step-${i}`;
      const position = getElementPosition(stepId);
      if (position) positions[stepId] = position;
    });

    const chatId = `${currentWorkflow.name}-chat`;
    const chatPosition = getElementPosition(chatId);
    if (chatPosition) positions[chatId] = chatPosition;
    else calculationPossible = false;

    const requiredPositionsFound = currentWorkflow.roles.every((_, i) => positions[`${currentWorkflow.name}-role-${i}`]) && positions[chatId];

    if (Object.keys(positions).length > 0 && requiredPositionsFound) {
       console.log(`Calculated ${Object.keys(positions).length} element positions`);
       setElementPositions(positions);
       calculationRetryRef.current = 0;

       if (selectedRoleIndex !== null) {
           console.log("Positions updated while role selected, re-running animation setup.");
           queueMicrotask(() => {
               handleRoleClick(selectedRoleIndex, true);
           });
       }
    } else if (calculationRetryRef.current < maxCalculationRetries && !requiredPositionsFound) {
      calculationRetryRef.current += 1;
      const delay = Math.min(100 * calculationRetryRef.current, 500);
      console.log(`Retrying position calculation (${calculationRetryRef.current}/${maxCalculationRetries}) in ${delay}ms`);
      setTimeout(() => calculatePositions(), delay);
    } else if (!requiredPositionsFound) {
      console.error("Failed to calculate required positions (roles, chat) after maximum retries");
    }
  }, [currentWorkflow.name, currentWorkflow.roles, currentWorkflow.workflowSteps, selectedRoleIndex]);

  const handleServiceSelect = (index: number) => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
    const previousWorkflowName = serviceWorkflows[selectedServiceIndex].name;
    gsap.set(
      `[id^="${previousWorkflowName}-step-"], #${previousWorkflowName}-chat, [id^="path-${previousWorkflowName}-"]`,
      { opacity: 0, scale: 0.9, clearProps: "all" }
    );
    gsap.set(
        `[id^="path-${previousWorkflowName}-"]`, { strokeDashoffset: '1000', strokeDasharray: '1000 1000', clearProps: "all" }
    );

    if (index === selectedServiceIndex && selectedRoleIndex !== null) {
      setSelectedRoleIndex(null);
      setIsBotResponseVisible(false);
    } else if (index !== selectedServiceIndex) {
      setSelectedRoleIndex(null);
      setIsBotResponseVisible(false);
      setSelectedServiceIndex(index);
      setElementPositions({});
      setTimeout(() => calculatePositions(), 50);
    }
  };

  const handleRoleClick = (roleIndex: number, isPositionUpdate = false) => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    if (!isPositionUpdate) {
        gsap.set(
          `[id^="${currentWorkflow.name}-step-"], #${currentWorkflow.name}-chat`,
          { opacity: 0, scale: 0.9, transformOrigin: "center center" }
        );
        gsap.set(
          `[id^="path-${currentWorkflow.name}-"]`,
          { opacity: 0, strokeDashoffset: 1000, strokeDasharray: '1000 1000' }
        );
    } else {
         gsap.set(
          `[id^="path-${currentWorkflow.name}-"]`,
          { opacity: 0, strokeDashoffset: 1000, strokeDasharray: '1000 1000' }
        );
    }

    if (roleIndex === selectedRoleIndex && !isPositionUpdate) {
      setSelectedRoleIndex(null);
      setIsBotResponseVisible(false);
      return;
    }

    if (!isPositionUpdate) {
        setSelectedRoleIndex(roleIndex);
        setIsBotResponseVisible(false);

        // Make chat box visible immediately
        const chatIdElement = document.getElementById(`${currentWorkflow.name}-chat`);
        if (chatIdElement) {
            gsap.set(chatIdElement, { opacity: 1, scale: 1, transformOrigin: "center center" });
        }
        // Reset other steps for animation
        gsap.set(
          `[id^="${currentWorkflow.name}-step-"]`,
          { opacity: 0, scale: 0.9, transformOrigin: "center center" }
        );
    }

    const roleId = `${currentWorkflow.name}-role-${roleIndex}`;
    const chatId = `${currentWorkflow.name}-chat`;
    const requiredIds = [roleId, chatId, ...currentWorkflow.workflowSteps.map((_, i) => `${currentWorkflow.name}-step-${i}`)];
    const allPositionsReady = requiredIds.every(id => elementPositions[id]);

    if (!allPositionsReady) {
        console.warn("Positions not ready for all animation elements, attempting recalculation...");
        calculatePositions();
        setTimeout(() => {
            const afterDelayPositionsReady = requiredIds.every(id => elementPositions[id]);
            if (!afterDelayPositionsReady) {
                console.error("Still missing element positions after delay. Cannot start animation.");
                return;
            } else {
                 handleRoleClick(roleIndex, false);
            }
        }, 200);
        return;
    }

    console.log("Starting GSAP animation sequence for role:", roleIndex);
    const tl = gsap.timeline({
      onComplete: () => { timelineRef.current = null; console.log("GSAP Timeline Complete"); },
      onInterrupt: () => { console.log("GSAP Timeline Interrupted"); }
    });
    timelineRef.current = tl;

    let sequence: number[] = [];
    if (roleIndex < 2) {
      sequence = [0, 1, 2, 5];
    } else {
      sequence = [0, 4, 3, 5];
    }

    const getStepId = (stepIndex: number) => `${currentWorkflow.name}-step-${stepIndex}`;

    // Adjusted durations and easing for slower, smoother animations
    const pathDuration = 1.8; // Increased path animation duration
    const blockDuration = 1.2; // Increased block pop-up duration
    const blockEase = "power2.out"; // Smoother ease for blocks

    const animatePath = (pathElementId: string, duration = pathDuration, delay = 0) => {
        const pathElement = document.getElementById(pathElementId);
        if (!pathElement || !(pathElement instanceof SVGPathElement)) {
            console.error(`Path element not found or not an SVGPathElement: ${pathElementId}`);
            tl.to({}, {duration: 0.01}); // Add a small delay to keep timeline consistent
            return;
        }
        const path = pathElement;
        const length = path.getTotalLength();
        if (!length || length <= 0 || !isFinite(length)) {
            console.warn(`Path ${pathElementId} has invalid length: ${length}. Skipping animation.`);
            path.style.opacity = '0';
            tl.to({}, {duration: 0.01}); // Add a small delay
            return;
        }
        gsap.set(path, {
            strokeDasharray: length + " " + length,
            strokeDashoffset: length,
            opacity: 1
        });

        tl.to(path, {
            strokeDashoffset: 0,
            duration: duration,
            ease: "none", // Linear ease works well for path drawing
            delay: delay
        }, ">"); // Execute after previous animation completes
    };

    const popUpBlock = (elementId: string, duration = blockDuration, delay = 0) => {
       const block = document.getElementById(elementId);
       if (!block) {
           console.error(`Block element not found: ${elementId}`);
           tl.to({}, {duration: 0.01}); // Add a small delay
           return;
       }
       gsap.set(block, { transformOrigin: "center center" });
       tl.to(block, {
           opacity: 1,
           scale: 1,
           duration: duration,
           ease: blockEase, // Use the smoother ease
           delay: delay
       }, "<"); // Execute concurrently with the start of the previous animation (path drawing)
    };

    const firstStepIndex = sequence[0];
    const firstStepId = getStepId(firstStepIndex);
    const pathRoleToStep0Id = `path-${roleId}-${firstStepId}`;
    animatePath(pathRoleToStep0Id);
    popUpBlock(firstStepId);

    for (let i = 0; i < sequence.length - 1; i++) {
        const currentStepIdx = sequence[i];
        const nextStepIdx = sequence[i + 1];
        const currentStepId = getStepId(currentStepIdx);
        const nextStepId = getStepId(nextStepIdx);
        const pathStepToStepId = `path-${currentStepId}-${nextStepId}`;

        // Add slight delay between steps if needed, e.g., delay: 0.2
        animatePath(pathStepToStepId);
        popUpBlock(nextStepId);
    }

    const lastStepIndex = sequence[sequence.length - 1];
    const lastStepId = getStepId(lastStepIndex);
    const pathLastStepToChatId = `path-${lastStepId}-${chatId}`;
    animatePath(pathLastStepToChatId);

    // Adjust the delay for the bot response visibility if needed due to longer animation
    tl.call(() => setIsBotResponseVisible(true), [], ">-=0.5"); // Show response slightly before the last path finishes

  };

  useEffect(() => {
    window.addEventListener('resize', calculatePositions);
    
    return () => {
      window.removeEventListener('resize', calculatePositions);
    };
  }, [calculatePositions]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothMousePosition, setSmoothMousePosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const springStrength = 0.1;
    const dampening = 0.8;
    let currentVelocity = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const animateMousePosition = () => {
      const dx = mousePosition.x - smoothMousePosition.x;
      const dy = mousePosition.y - smoothMousePosition.y;
      currentVelocity.x = currentVelocity.x * dampening + dx * springStrength;
      currentVelocity.y = currentVelocity.y * dampening + dy * springStrength;
      setSmoothMousePosition(prev => ({
        x: prev.x + currentVelocity.x,
        y: prev.y + currentVelocity.y
      }));
      animationFrameRef.current = requestAnimationFrame(animateMousePosition);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(animateMousePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
       console.log("FlowchartPage: Mouse move effect cleanup.");
    };
  }, []);


  const backgroundStyle = {
    '--mouse-x': `${smoothMousePosition.x}px`,
    '--mouse-y': `${smoothMousePosition.y}px`,
  } as React.CSSProperties;

  console.log("Rendering FlowchartPage. Selected Role:", selectedRoleIndex, "Positions:", Object.keys(elementPositions).length);

  return (
    <div
      className="min-h-screen overflow-x-hidden relative background-gradient-container"
      style={backgroundStyle}
    >
       <Navbar />

       <div
         className="w-full py-10 px-4 text-center relative z-10 mt-24 mb-10"
         style={{ perspective: '1000px' }}
       >
         <h3 className="text-xpectrum-purple font-medium tracking-wide uppercase mb-3 text-lg">HOW XPECTRUM WORKS</h3>
         <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
           Automate any business process<br />with Agentic AI
         </h2>

         <div className="flex flex-wrap justify-center gap-4 mb-10">
           {serviceWorkflows.map((service, index) => (
             <button
               key={service.name}
               onClick={() => handleServiceSelect(index)}
               className={`flex items-center px-5 py-3 rounded-lg transition-all duration-300 ${
                 selectedServiceIndex === index
                   ? 'bg-xpectrum-purple text-white shadow-md scale-105'
                   : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-100 hover:-translate-y-1'
               }`}
             >
               <service.icon className="w-5 h-5 mr-2" />
               <span className="font-medium text-base">{service.name}</span>
             </button>
           ))}
         </div>
         
         <div
           ref={workflowChartContainerRef}
           className="max-w-5xl mx-auto relative bg-white/30 backdrop-blur-sm"
           key={`workflow-container-${selectedServiceIndex}`}
           style={{
             backgroundImage: "linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)",
             backgroundSize: "20px 20px",
             padding: "30px 0",
             borderRadius: "12px",
             minHeight: "550px",
             boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
             border: "1px solid rgba(229, 231, 235, 0.5)"
           }}>
             
             {showDebug && (
               <div className="absolute top-0 right-0 bg-white/90 p-3 text-xs text-left border border-gray-200 rounded-bl-lg z-50 shadow-sm max-w-[300px] max-h-[300px] overflow-auto">
                 <h5 className="font-bold">Debug Info:</h5>
                 <div>Selected Service: {selectedServiceIndex} ({currentWorkflow.name})</div>
                 <div>Selected Role: {selectedRoleIndex !== null ? selectedRoleIndex : 'none'}</div>
                 <div>Elements with positions: {Object.keys(elementPositions).length}</div>
                 <details>
                   <summary>Position Keys ({Object.keys(elementPositions).length})</summary>
                   <ul className="pl-3">
                     {Object.keys(elementPositions).map((key) => (
                       <li key={key} className="text-[10px]">{key}</li>
                     ))}
                   </ul>
                 </details>
                 <details>
                   <summary>Workflow Steps ({currentWorkflow.workflowSteps.length})</summary>
                   <ul className="pl-3">
                     {currentWorkflow.workflowSteps.map((step, idx) => (
                       <li key={idx} className="text-[10px]">{idx}: {step.title} (ID: {`${currentWorkflow.name}-step-${idx}`})</li>
                     ))}
                   </ul>
                 </details>
                 <div>Timeline Active: {timelineRef.current ? 'Yes' : 'No'}</div>
               </div>
             )}
             
             {Object.keys(elementPositions).length === 0 && (
               <div className="flex flex-col items-center justify-center h-[480px] text-gray-600">
                 <div className="mb-4">
                   <svg className="animate-spin h-8 w-8 text-xpectrum-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                 </div>
                 <p>Initializing workflow view...</p>
                 <button 
                   onClick={calculatePositions}
                   className="mt-4 bg-xpectrum-purple text-white px-3 py-1 rounded text-sm hover:bg-xpectrum-darkpurple transition-colors"
                 >
                   Recalculate Positions
                 </button>
               </div>
             )}
             
             <div className={`relative flex justify-between items-center px-8 h-[480px] z-20 transition-opacity duration-300 ${Object.keys(elementPositions).length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex flex-col space-y-3">
                   <div className="mb-2 text-gray-700 font-medium text-sm">Select a Role:</div>
                   {currentWorkflow.roles.map((role, i) => (
                      <div key={`${currentWorkflow.name}-role-${i}-wrapper`}>
                          <WorkflowBlock
                             id={`${currentWorkflow.name}-role-${i}`}
                             title={role.title}
                             IconComponent={<role.icon size={20}/>}
                             onClick={() => handleRoleClick(i)}
                             isSelected={selectedRoleIndex === i}
                             color={selectedRoleIndex === i ? 'primary' : 'dark'}
                             className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 !opacity-100 !scale-100"
                             is3D={true}
                             variant={undefined}
                          />
                      </div>
                   ))}
                </div>

               <div className="border border-gray-200 rounded-xl bg-white/70 shadow-sm w-[400px] h-[360px] grid grid-cols-3 grid-rows-2 gap-4 justify-items-center items-center px-4 py-4 relative mx-6 z-30">
                 {currentWorkflow.workflowSteps.map((step, index) => (
                   <div
                     key={`${currentWorkflow.name}-step-${index}-wrapper`}
                     className="flex justify-center items-center"
                     style={{
                       gridRow: step.position.row,
                       gridColumn: step.position.col,
                       width: '100%', height: '100%'
                     }}
                   >
                     <WorkflowBlock
                       id={`${currentWorkflow.name}-step-${index}`}
                       title={step.title}
                       color={'dark'}
                       IconComponent={step.icon && <step.icon size={20} className={"text-gray-900"} />}
                       variant={step.variant}
                       className="transition-colors duration-300"
                       is3D={true}
                     />
                   </div>
                 ))}
               </div>

               <div className="flex flex-col items-end relative z-30">
                  <div key={`${currentWorkflow.name}-chat-wrapper`}>
                     <ChatExample
                       id={`${currentWorkflow.name}-chat`}
                       userMessage={currentWorkflow.chatExample.user}
                       botMessage={currentWorkflow.chatExample.bot}
                       serviceColor={currentWorkflow.color || 'bg-xpectrum-purple'}
                       showBotResponse={isBotResponseVisible}
                     />
                 </div>
               </div>
             </div>

             <div className="absolute inset-0 z-10 pointer-events-none overflow-visible">
                {currentWorkflow.roles.map((_, roleIndex) => {
                    const roleId = `${currentWorkflow.name}-role-${roleIndex}`;
                    const firstStepId = `${currentWorkflow.name}-step-0`;
                    const pathId = `path-${roleId}-${firstStepId}`;
                    if (elementPositions[roleId] && elementPositions[firstStepId]) {
                        return (
                            <Connection
                                key={pathId}
                                from={roleId} to={firstStepId}
                                path={calculateSmoothCurvePath(
                                    elementPositions[roleId],
                                    elementPositions[firstStepId]
                                )}
                                serviceColor={currentWorkflow.color}
                            />
                        );
                    }
                    return null;
                })}

                {[ [0, 1], [1, 2], [2, 5] ].map(([fromIdx, toIdx]) => {
                    const fromStepId = `${currentWorkflow.name}-step-${fromIdx}`;
                    const toStepId = `${currentWorkflow.name}-step-${toIdx}`;
                    const pathId = `path-${fromStepId}-${toStepId}`;
                    if (elementPositions[fromStepId] && elementPositions[toStepId]) {
                        return (
                           <Connection
                              key={pathId}
                              from={fromStepId} to={toStepId}
                              path={calculateSmoothCurvePath(
                                  elementPositions[fromStepId],
                                  elementPositions[toStepId]
                              )}
                              serviceColor={currentWorkflow.color}
                            />
                        );
                    }
                    return null;
                })}

                {[ [0, 4], [4, 3], [3, 5] ].map(([fromIdx, toIdx]) => {
                    const fromStepId = `${currentWorkflow.name}-step-${fromIdx}`;
                    const toStepId = `${currentWorkflow.name}-step-${toIdx}`;
                    const pathId = `path-${fromStepId}-${toStepId}`;
                    if (elementPositions[fromStepId] && elementPositions[toStepId]) {
                        return (
                            <Connection
                                key={pathId}
                                from={fromStepId} to={toStepId}
                                path={calculateSmoothCurvePath(
                                    elementPositions[fromStepId],
                                    elementPositions[toStepId]
                                )}
                                serviceColor={currentWorkflow.color}
                             />
                         );
                    }
                    return null;
                })}

                {(() => {
                    const fromStepId = `${currentWorkflow.name}-step-5`;
                    const toId = `${currentWorkflow.name}-chat`;
                    const pathId = `path-${fromStepId}-${toId}`;
                     if (elementPositions[fromStepId] && elementPositions[toId]) {
                        return (
                            <Connection
                                key={pathId}
                                from={fromStepId} to={toId}
                                path={calculateSmoothCurvePath(
                                    elementPositions[fromStepId],
                                    elementPositions[toId]
                                )}
                                serviceColor={currentWorkflow.color}
                            />
                        );
                    }
                    return null;
                })()}
             </div>
         </div>

         <button
           className="mt-10 bg-xpectrum-purple hover:bg-xpectrum-darkpurple text-white px-7 py-3.5 rounded-full font-medium text-lg transition duration-300 shadow-sm hover:shadow-md hover:scale-103 active:scale-97"
         >
           Hire Xpectrum today
         </button>
       </div>

       <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: rgba(123, 104, 238, 0.6); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(123, 104, 238, 0.8); }

        .background-gradient-container {
          --gradient-color-1: #f0e6ff; --gradient-color-2: #e6f0ff;
          --gradient-color-3: #fff2e6; --gradient-color-4: #ffe6f2;
          background: linear-gradient(-45deg, var(--gradient-color-1), var(--gradient-color-2), var(--gradient-color-3), var(--gradient-color-4));
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
          overflow: hidden;
          position: relative;
        }
        .background-gradient-container::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(123, 104, 238, 0.25) 0%, rgba(123, 104, 238, 0.08) 30%, transparent 60%);
          z-index: 0; pointer-events: none; will-change: background; filter: blur(4px);
        }
        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .background-gradient-container::after {
          content: ""; position: absolute; inset: -100%;
          background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
          opacity: 0.04; pointer-events: none; animation: noiseAnim 0.5s infinite steps(1); z-index: 0;
        }
        @keyframes noiseAnim { 0% { transform: translate(2px, 3px); } 10% { transform: translate(-2px, -3px); } 20% { transform: translate(3px, -2px); } 30% { transform: translate(-3px, 2px); } 40% { transform: translate(2px, 2px); } 50% { transform: translate(-2px, -2px); } 60% { transform: translate(3px, 3px); } 70% { transform: translate(-3px, -3px); } 80% { transform: translate(2px, -3px); } 90% { transform: translate(-2px, 3px); } 100% { transform: translate(3px, -2px); } }
        @keyframes float-particle { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(5px, 5px); } 50% { transform: translate(10px, 0); } 75% { transform: translate(5px, -5px); } }
        nav { z-index: 50; }
      `}</style>

       <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
         {Array.from({ length: 15 }).map((_, index) => (
           <div
             key={index}
             className="absolute rounded-full"
             style={{
               width: `${Math.random() * 5 + 2}px`,
               height: `${Math.random() * 5 + 2}px`,
               background: `rgba(123, 104, 238, ${Math.random() * 0.15 + 0.05})`,
               top: `${Math.random() * 100}%`,
               left: `${Math.random() * 100}%`,
               animation: `float-particle ${Math.random() * 10 + 10}s infinite alternate ease-in-out`,
               animationDelay: `${Math.random() * 5}s`,
               filter: "blur(1px)",
               transform: "translate3d(0,0,0)"
             }}
           />
         ))}
       </div>
    </div>
  );
};

export default FlowchartPage; 