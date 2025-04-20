import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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
  delay: number;
  color?: 'primary' | 'dark' | 'inactive';
  className?: string;
  IconComponent?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  is3D?: boolean;
  id?: string;
  variant?: WorkflowStepVariant;
  isAnimating?: boolean;
}

const WorkflowBlock: React.FC<WorkflowBlockProps> = ({
  title,
  icon: Icon = Bot,
  delay,
  color = 'dark',
  className = '',
  IconComponent,
  onClick,
  isSelected,
  is3D = true,
  id,
  variant,
  isAnimating,
}) => {
  const DisplayIcon = IconComponent || <Icon size={22} className="text-gray-900" />;

  const getBgColor = () => {
    if (color === 'primary' || isSelected) return 'bg-xpectrum-purple';
    if (isAnimating) return 'bg-xpectrum-purple/90'; // Highlight animating blocks
    if (color === 'dark') return 'bg-gray-100';
    return 'bg-gray-100';
  };

  const getTextColor = () => {
    if (color === 'primary' || isSelected || isAnimating) return 'text-white';
    return 'text-gray-700';
  };

  const getShadowStyle = () => {
    if (!is3D) return '';
    if (isAnimating) return 'shadow-xl shadow-xpectrum-purple/60 translate-y-[-3px]'; // Increased shadow intensity
    if (color === 'primary' || isSelected)
      return 'shadow-lg shadow-xpectrum-purple/25';
    return 'shadow-md shadow-gray-300/60';
  };

  const get3DStyle = () => {
    if (!is3D) return '';
    if (color === 'primary' || isSelected || isAnimating)
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

  const hoverAnimation = onClick ? {
    scale: 1.06,
    y: -4,
    rotateX: 5,
    rotateY: -3,
    boxShadow: isAnimating
      ? '0px 12px 24px rgba(123, 104, 238, 0.55)' // Increased shadow
      : (color === 'primary' || isSelected)
        ? '0px 8px 16px rgba(123, 104, 238, 0.3)'
        : '0px 6px 12px rgba(150, 150, 150, 0.4)'
  } : {};

  const animateState = isAnimating ? {
    scale: 1.05, // Increased scale
    y: -3, // More pronounced lift
    boxShadow: ['0px 6px 15px rgba(123, 104, 238, 0.3)', '0px 10px 25px rgba(123, 104, 238, 0.6)', '0px 6px 15px rgba(123, 104, 238, 0.3)'],
    transition: {
      boxShadow: {
        repeat: Infinity,
        duration: 2, // Pulse slower
      }
    }
  } : {};

  return (
    <motion.div
      id={id}
      className={`relative p-3 rounded-lg ${getBgColor()} ${getTextColor()} ${cursorStyle} ${getShadowStyle()} ${get3DStyle()} ${getVariantStyle()} ${className} transition-all duration-300 flex flex-col justify-between text-center w-[100px] h-[100px] items-center`}
      style={{ transformStyle: 'preserve-3d' }}
      onClick={onClick}
      whileHover={hoverAnimation}
      animate={animateState}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={`w-10 h-10 ${getIconBgColor()} rounded-lg flex items-center justify-center mx-auto mb-2 ${getTextColor() === 'text-white' ? 'text-gray-700' : 'text-gray-900'}`}>
        {DisplayIcon}
      </div>
      <span className="font-medium text-[14px] text-center leading-tight">{title}</span>
    </motion.div>
  );
};


interface ChatExampleProps {
  delay: number;
  userMessage: string;
  botMessage: string;
  serviceColor?: string;
  id?: string;
}

const ChatExample: React.FC<ChatExampleProps> = ({ delay, userMessage, botMessage, serviceColor = 'bg-xpectrum-purple', id }) => {
  const isDynamicColor = serviceColor && !serviceColor.startsWith('bg-');
  const dynamicBgStyle = isDynamicColor ? { backgroundColor: serviceColor } : {};
  const staticBgClass = !isDynamicColor ? serviceColor : 'bg-xpectrum-purple';

  return (
  <motion.div
    id={id}
    className="bg-white rounded-xl shadow-sm p-4 w-72 h-auto border border-gray-100 min-h-[220px] flex flex-col"
    initial={{ opacity: 0, x: 15 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3, delay: delay }}
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

    <div className="space-y-3 flex-grow">
      <div className="flex justify-end mb-2">
        <div className="bg-gray-100 rounded-t-lg rounded-bl-lg px-3 py-2 max-w-[85%]">
          <p className="text-[14px] text-gray-700">{userMessage}</p>
        </div>
      </div>

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
          <p className="text-[14px] text-white">{botMessage}</p>
        </div>
      </div>
    </div>

    <div className="mt-3 bg-white rounded-lg p-2 h-28 border border-gray-100">
      <div className="text-[14px] font-medium text-gray-700 mb-2">Dashboard</div>
      <div className="grid grid-cols-2 gap-2 h-[calc(100%-24px)]">
        <div className="bg-gray-50 rounded p-1 flex items-center justify-center">
          <div className="w-full h-full relative">
            <div className="absolute inset-0">
              <div className={`${staticBgClass} h-full w-3/4 rounded-sm`} style={dynamicBgStyle}></div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded p-1">
          <div className={`${staticBgClass} h-2 rounded-sm w-full mb-1`} style={dynamicBgStyle}></div>
          <div className="h-2 bg-xpectrum-magenta/70 rounded-sm w-2/3 mb-1"></div>
          <div className="h-2 bg-xpectrum-blue/70 rounded-sm w-1/2"></div>
        </div>
        <div className="col-span-2 bg-gray-50 rounded p-1 flex items-end space-x-0.5">
          <div className={`${staticBgClass} h-3/5 w-full rounded-sm`} style={dynamicBgStyle}></div>
          <div className="bg-xpectrum-magenta/70 h-4/5 w-full rounded-sm"></div>
          <div className="bg-xpectrum-blue/70 h-2/5 w-full rounded-sm"></div>
          <div className={`${staticBgClass} h-3/5 w-full rounded-sm`} style={dynamicBgStyle}></div>
          <div className="bg-xpectrum-blue/70 h-2/5 w-full rounded-sm"></div>
          <div className="bg-xpectrum-magenta/70 h-4/5 w-full rounded-sm"></div>
        </div>
      </div>
    </div>
  </motion.div>
)};


interface ConnectionProps {
  from: string;
  to: string;
  delay: number;
  path?: string;
  isActive?: boolean;
  serviceColor?: string;
}

const Connection: React.FC<ConnectionProps> = ({ from, to, delay, path, isActive = false, serviceColor = '#7b68ee' }) => {
  const connectionDrawDuration = 1.2; // Increased from 0.8
  const particleAnimationDelay = 0.1; // Reduced from 0.2

  // Add simple default path if none provided
  const safePath = path || 'M0,0 L100,100';

  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      style={{
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg className="absolute w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`gradient-${from}-${to}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isActive ? serviceColor : "#d1d5db"} />
            <stop offset="100%" stopColor={isActive ? serviceColor : "#d1d5db"} />
          </linearGradient>

          <filter id={`glow-${from}-${to}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" /> {/* Increased from 4 */}
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Add marker for animated path */}
          <marker 
            id={`arrow-${from}-${to}`} 
            viewBox="0 0 10 10" 
            refX="5" 
            refY="5" 
            markerWidth="6" 
            markerHeight="6" 
            orient="auto-start-reverse"
          >
            <circle cx="5" cy="5" r="4" fill={serviceColor} />
          </marker>
        </defs>

        {/* Background path */}
        <path
          d={safePath}
          stroke="#e5e7eb"
          strokeWidth="6" /* Increased from 5 */
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Animated path */}
        <motion.path
          d={safePath}
          stroke={isActive ? `url(#gradient-${from}-${to})` : "#d1d5db"}
          strokeWidth="3.5" /* Increased from 2.5 */
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={isActive ? `url(#glow-${from}-${to})` : ""}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isActive ? 1 : 0 }}
          transition={{ duration: connectionDrawDuration, ease: "easeInOut", delay: isActive ? delay : 0 }}
          style={{ transition: "stroke 0.3s ease" }}
        />

        {/* Animated particles on the path - only if active and path is valid */}
        {isActive && safePath && (
          <>
            <motion.circle 
              r="8" /* Increased from 6 */
              fill={`${serviceColor}60`} /* Increased opacity from 40 to 60 */
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + particleAnimationDelay, duration: 0.3 }}
            >
              <animateMotion
                dur="1.5s"
                repeatCount="indefinite"
                path={safePath}
              />
            </motion.circle>

            <motion.circle 
              r="4" /* Increased from 3 */
              fill={serviceColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + particleAnimationDelay + 0.1, duration: 0.3 }}
            >
              <animateMotion
                dur="1.5s"
                repeatCount="indefinite"
                path={safePath}
              />
            </motion.circle>
            
            {/* Add an additional particle for more visibility */}
            <motion.circle 
              r="5"
              fill={`${serviceColor}80`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + particleAnimationDelay + 0.2, duration: 0.3 }}
            >
              <animateMotion
                dur="1.5s"
                begin="0.5s" /* Offset timing */
                repeatCount="indefinite"
                path={safePath}
              />
            </motion.circle>
          </>
        )}
      </svg>
    </motion.div>
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
  const [animatingSteps, setAnimatingSteps] = useState<number[]>([]);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [forceVisibility, setForceVisibility] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // Add debugging state
  const workflowChartContainerRef = useRef<HTMLDivElement>(null);

  // Track animation timeouts so they can be cleared when needed
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const calculationRetryRef = useRef<number>(0);
  const maxCalculationRetries = 5;

  // Get current workflow data
  const currentWorkflow = serviceWorkflows[selectedServiceIndex];

  // Clear animation timeouts to prevent memory leaks
  const clearAnimationTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // Force immediate display of the flowchart for initial render
  useEffect(() => {
    // Add keypress handler for debug mode (press 'd')
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd') {
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Calculate positions after a slight delay to ensure DOM is ready
    setTimeout(() => {
      calculatePositions();
    }, 300);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentWorkflow]);  // Don't automatically set visibleSteps here

  // Replace the useEffect for forceVisibility to fix the dependency order problem
  useEffect(() => {
    // If a role is selected but no steps are visible after a delay, force visibility
    if (selectedRoleIndex !== null && visibleSteps.length === 0) {
      const forceVisibilityTimeout = setTimeout(() => {
        console.log("Force visibility check running...");
        // If still no steps visible, force them all to be visible
        if (visibleSteps.length === 0) {
          console.log("Forcing visibility of all workflow steps");
          setForceVisibility(true);
          
          // Determine the sequence based on role index
          let sequence: number[] = [];
          if (selectedRoleIndex < 2) {
            sequence = [0, 1, 2, 5];
          } else {
            sequence = [0, 4, 3, 5];
          }
          
          // Activate all steps at once for visibility
          setAnimatingSteps(sequence);
          setVisibleSteps(sequence);
          
          // Recalculate positions but use a callback to avoid the dependency
          setTimeout(() => {
            requestAnimationFrame(() => {
              if (workflowChartContainerRef.current) {
                calculatePositions();
              }
            });
          }, 100);
        }
      }, 2000); // Reduced from 3000 for faster fallback
      
      return () => clearTimeout(forceVisibilityTimeout);
    } else if (selectedRoleIndex === null) {
      // Reset when no role is selected
      setForceVisibility(false);
    }
  }, [selectedRoleIndex, visibleSteps.length]); // Removed calculatePositions from dependency array

  // Function to calculate positions of elements for drawing connections
  const calculatePositions = useCallback(() => {
    if (!workflowChartContainerRef.current) {
      console.warn("Workflow chart container ref not available");
      return;
    }

    // Check if elements are ready to be measured
    let calculationPossible = true;
    const positions: Record<string, Position> = {};
    const containerRect = workflowChartContainerRef.current.getBoundingClientRect();

    // Use a more direct approach for getting element positions
    const getElementPosition = (id: string): Position | null => {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`Element with id ${id} not found`);
        return null;
      }
      
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height
      };
    };

    // Calculate positions for roles
    currentWorkflow.roles.forEach((_, i) => {
      const roleId = `${currentWorkflow.name}-role-${i}`;
      const position = getElementPosition(roleId);
      if (position) {
        positions[roleId] = position;
      } else {
        calculationPossible = false;
      }
    });

    // Calculate position for workflow steps
    currentWorkflow.workflowSteps.forEach((_, i) => {
      const stepId = `${currentWorkflow.name}-step-${i}`;
      const position = getElementPosition(stepId);
      if (position) {
        positions[stepId] = position;
      } else {
        // For steps, we'll log but not fail the calculation
        console.warn(`Step element ${stepId} not found or not positioned yet`);
      }
    });

    // Calculate position for chat example
    const chatId = `${currentWorkflow.name}-chat`;
    const chatPosition = getElementPosition(chatId);
    if (chatPosition) {
      positions[chatId] = chatPosition;
    } else {
      calculationPossible = false;
    }
    
    // Update state if we have at least the basic positions
    if (Object.keys(positions).length > 0) {
      console.log(`Calculated ${Object.keys(positions).length} element positions`);
      setElementPositions(positions);
      calculationRetryRef.current = 0; // Reset retry counter on success
    } else if (calculationRetryRef.current < maxCalculationRetries) {
      // Retry calculation with exponential backoff
      calculationRetryRef.current += 1;
      const delay = Math.min(200 * calculationRetryRef.current, 1000); // Max 1 second delay
      console.log(`Retrying position calculation (${calculationRetryRef.current}/${maxCalculationRetries}) in ${delay}ms`);
      setTimeout(() => calculatePositions(), delay);
    } else {
      console.error("Failed to calculate positions after maximum retries");
      // Set force visibility as a last resort
      setForceVisibility(true);
    }
  }, [currentWorkflow]); // Only depend on currentWorkflow

  const handleServiceSelect = (index: number) => {
    clearAnimationTimeouts();
    if (index === selectedServiceIndex && selectedRoleIndex !== null) {
      // If clicking the already selected service, reset the role selection
      setSelectedRoleIndex(null);
      setAnimatingSteps([]);
      setVisibleSteps([]);
    } else if (index !== selectedServiceIndex) {
      // If changing service, reset role and trigger service change
      setSelectedRoleIndex(null);
      setAnimatingSteps([]);
      setVisibleSteps([]);
      // Delay service index change slightly to allow for animations to clear
      timeoutsRef.current.push(setTimeout(() => {
        setSelectedServiceIndex(index);
        setElementPositions({}); // Clear positions when service changes
      }, 150)); // Reduced delay
    }
  };

  const handleRoleClick = (index: number) => {
    clearAnimationTimeouts();

    if (index === selectedRoleIndex) {
      // Deselect role
      setSelectedRoleIndex(null);
      setAnimatingSteps([]);
      setVisibleSteps([]);
      return;
    }

    // Select new role and reset animations
    setSelectedRoleIndex(index);
    setAnimatingSteps([]);
    setVisibleSteps([]); 

    // Calculate initial positions (roles, chat, any already visible elements)
    requestAnimationFrame(() => calculatePositions());

    // Define animation timing constants - slowed down for visibility
    const initialDelay = 700; // Slower start
    const stepAnimationDelay = 1800; // Much slower time between steps
    const stepVisibilityDelay = 400; // Slower delay between connection animation start and block visibility

    // Define the sequence based on role index
    let sequence: number[] = [];
    if (index < 2) { // Roles 0, 1 use sequence 1
      sequence = [0, 1, 2, 5];
    } else { // Roles 2, 3 use sequence 2
      sequence = [0, 4, 3, 5];
    }

    let accumulatedDelay = initialDelay;

    // First animate the connection from role to first step
    timeoutsRef.current.push(setTimeout(() => {
      setAnimatingSteps([sequence[0]]); // Start with the first step active
      console.log(`[Animation] Activating first connection to step ${sequence[0]}`);
    }, accumulatedDelay));

    // Then make the first step visible and recalculate positions
    timeoutsRef.current.push(setTimeout(() => {
      setVisibleSteps([sequence[0]]); // Start with only the first step visible
      console.log(`[Animation] Making step ${sequence[0]} visible`);
      // Recalculate after the step should be rendered
      requestAnimationFrame(() => calculatePositions()); 
    }, accumulatedDelay + stepVisibilityDelay));

    // Animate remaining steps in sequence
    for (let i = 0; i < sequence.length - 1; i++) {
      const currentStepIndex = sequence[i];
      const nextStepIndex = sequence[i + 1];
      
      accumulatedDelay += stepAnimationDelay;
      
      // Animate connection to next step
      timeoutsRef.current.push(setTimeout(() => {
        // Only keep the current connection animating for clarity
        setAnimatingSteps([nextStepIndex]); 
        console.log(`[Animation] Activating connection from step ${currentStepIndex} to ${nextStepIndex}`);
      }, accumulatedDelay));
      
      // Make next step visible and recalculate positions
      timeoutsRef.current.push(setTimeout(() => {
        setVisibleSteps(prev => [...prev, nextStepIndex]); // Add the next step to the visible ones
        console.log(`[Animation] Making step ${nextStepIndex} visible`);
        // Recalculate after the step should be rendered
        requestAnimationFrame(() => calculatePositions()); 
      }, accumulatedDelay + stepVisibilityDelay));
    }

    // Finally, activate connection to chat
    accumulatedDelay += stepAnimationDelay;
    timeoutsRef.current.push(setTimeout(() => {
      const lastStepIndex = sequence[sequence.length - 1];
      // Ensure the final connection is marked as animating
      setAnimatingSteps([lastStepIndex]);
      console.log(`[Animation] Finalizing animation sequence, connecting to chat.`);
    }, accumulatedDelay));
  };

  // Add missing useEffect for automatic recalculation of positions on resize
  useEffect(() => {
    // Recalculate on window resize
    window.addEventListener('resize', calculatePositions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', calculatePositions);
      clearAnimationTimeouts(); // Ensure timeouts are cleared on unmount
    };
  }, [calculatePositions]); // Depend only on calculatePositions

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
  }, []); // Removed dependencies as they cause re-renders


  const backgroundStyle = {
    '--mouse-x': `${smoothMousePosition.x}px`,
    '--mouse-y': `${smoothMousePosition.y}px`,
  } as React.CSSProperties;

  console.log("Rendering FlowchartPage. Selected Role:", selectedRoleIndex, "Visible Steps:", visibleSteps.length, "Positions:", Object.keys(elementPositions).length);

  return (
    <div
      className="min-h-screen overflow-x-hidden relative background-gradient-container"
      style={backgroundStyle}
    >
       <Navbar />

       <motion.div
         className="w-full py-10 px-4 text-center relative z-10 mt-24 mb-10"
         style={{ perspective: '1000px' }}
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.4 }}
       >
         <h3 className="text-xpectrum-purple font-medium tracking-wide uppercase mb-3 text-lg">HOW XPECTRUM WORKS</h3>
         <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
           Automate any business process<br />with Agentic AI
         </h2>

         <div className="flex flex-wrap justify-center gap-4 mb-10">
           {serviceWorkflows.map((service, index) => (
             <motion.button
               key={service.name}
               onClick={() => handleServiceSelect(index)}
               className={`flex items-center px-5 py-3 rounded-lg transition-all duration-300 ${
                 selectedServiceIndex === index
                   ? 'bg-xpectrum-purple text-white shadow-md scale-105'
                   : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-100'
               }`}
               whileHover={{ y: -2 }}
               whileTap={{ scale: 0.98 }}
             >
               <service.icon className="w-5 h-5 mr-2" />
               <span className="font-medium text-base">{service.name}</span>
             </motion.button>
           ))}
         </div>
         
         <div
           ref={workflowChartContainerRef}
           className="max-w-5xl mx-auto relative bg-white/30 backdrop-blur-sm"
           key={`workflow-container-${selectedServiceIndex}`} // Better key for re-rendering
           style={{
             backgroundImage: "linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)",
             backgroundSize: "20px 20px",
             padding: "30px 0",
             borderRadius: "12px",
             minHeight: "550px",
             boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
             border: "1px solid rgba(229, 231, 235, 0.5)"
           }}>
             
             {/* Debug panel - only visible when debug mode is enabled */}
             {showDebug && (
               <div className="absolute top-0 right-0 bg-white/90 p-3 text-xs text-left border border-gray-200 rounded-bl-lg z-50 shadow-sm max-w-[300px] max-h-[300px] overflow-auto">
                 <h5 className="font-bold">Debug Info:</h5>
                 <div>Selected Service: {selectedServiceIndex}</div>
                 <div>Selected Role: {selectedRoleIndex !== null ? selectedRoleIndex : 'none'}</div>
                 <div>Visible Steps: {visibleSteps.join(', ')}</div>
                 <div>Animating Steps: {animatingSteps.join(', ')}</div>
                 <div>Force Visibility: {forceVisibility ? 'true' : 'false'}</div>
                 <div>Elements with positions: {Object.keys(elementPositions).length}</div>
                 <details>
                   <summary>Position Keys</summary>
                   <ul className="pl-3">
                     {Object.keys(elementPositions).map((key) => (
                       <li key={key} className="text-[10px]">{key}</li>
                     ))}
                   </ul>
                 </details>
               </div>
             )}
             
             {/* Fallback content - shown if positions haven't been calculated yet */}
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
             
             {/* Main layout container */}
             <div className={`relative flex justify-between items-center px-8 h-[480px] z-20 transition-opacity duration-300`}>
                {/* Left side - roles */}
                <div className="flex flex-col space-y-3">
                   <div className="mb-2 text-gray-700 font-medium text-sm">Select a Role:</div>
                   {currentWorkflow.roles.map((role, i) => (
                      <motion.div
                         key={`${currentWorkflow.name}-role-${i}-wrapper`}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                      >
                          <WorkflowBlock
                             id={`${currentWorkflow.name}-role-${i}`}
                             title={role.title}
                             IconComponent={<role.icon size={20}/>}
                             delay={0}
                             onClick={() => handleRoleClick(i)}
                             isSelected={selectedRoleIndex === i}
                             color={selectedRoleIndex === i ? 'primary' : 'dark'}
                             className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                             is3D={true}
                          />
                      </motion.div>
                   ))}
                </div>

               {/* Center - workflow steps - always show all steps initially */}
                <div className="border border-gray-200 rounded-xl bg-white/70 shadow-sm w-[400px] h-[360px] grid grid-cols-3 grid-rows-2 gap-4 justify-items-center items-center px-4 py-4 relative mx-6 z-30">
                  <AnimatePresence>
                    {currentWorkflow.workflowSteps.map((step, index) => (
                      (visibleSteps.includes(index) || (forceVisibility && selectedRoleIndex !== null)) && (
                        <motion.div
                          key={`${currentWorkflow.name}-step-${index}-wrapper`}
                          className="flex justify-center items-center"
                          style={{
                            gridRow: step.position.row, 
                            gridColumn: step.position.col,
                            width: '100%', // Ensure div takes grid cell space
                            height: '100%' // Ensure div takes grid cell space
                          }}
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 15 }}
                        >
                          <WorkflowBlock
                            id={`${currentWorkflow.name}-step-${index}`}
                            title={step.title}
                            delay={0}
                            color={(animatingSteps.includes(index)) ? 'primary' : 'dark'}
                            IconComponent={step.icon && <step.icon size={20} className={(animatingSteps.includes(index)) ? "text-gray-700" : "text-gray-900"} />}
                            variant={step.variant}
                            isAnimating={animatingSteps.includes(index)}
                            className="transition-all duration-300"
                            is3D={true}
                          />
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                </div>

               {/* Right side - chat example */}
                <div className="flex flex-col items-end relative z-30">
                   <motion.div
                      key={`${currentWorkflow.name}-chat-wrapper`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                     >
                      <ChatExample
                        id={`${currentWorkflow.name}-chat`}
                        delay={0}
                        userMessage={currentWorkflow.chatExample.user}
                        botMessage={currentWorkflow.chatExample.bot}
                        serviceColor={currentWorkflow.color || 'bg-xpectrum-purple'}
                      />
                  </motion.div>
                </div>
             </div>

             {/* SVG Connections Layer - Always render connections, but make them visible/invisible based on state */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Connection from selected role to first step - check positions exist */}
                {Object.keys(elementPositions).length > 0 && currentWorkflow.roles.map((_, roleIndex) => {
                  const roleId = `${currentWorkflow.name}-role-${roleIndex}`;
                  const firstStepId = `${currentWorkflow.name}-step-0`;
                  if (elementPositions[roleId] && elementPositions[firstStepId]) {
                    return (
                      <g key={`conn-role-${roleIndex}-fragment`}> 
                        <Connection
                          key={`conn-role-${roleIndex}-step-0`}
                          from={`role-${roleIndex}`} to="step-0"
                          delay={0.1}
                          path={calculateSmoothCurvePath(
                            elementPositions[roleId],
                            elementPositions[firstStepId]
                          )}
                          // Active if this role is selected and step 0 is the target
                          isActive={selectedRoleIndex === roleIndex && animatingSteps.length > 0 && animatingSteps[0] === 0}
                          serviceColor={currentWorkflow.color}
                        />
                      </g>
                    );
                  }
                  return null; // Don't render if positions aren't ready
                })}
                
                {/* Connections between steps - check positions exist */}
                  {Object.keys(elementPositions).length > 0 && (
                    <>
                      {/* Path 0→1→2→5 */}
                      {(elementPositions[`${currentWorkflow.name}-step-0`] && elementPositions[`${currentWorkflow.name}-step-1`]) && (
                        <Connection
                          key="conn-step-0-1"
                          from="step-0" to="step-1"
                          delay={0.1}
                          path={calculateSmoothCurvePath(
                            elementPositions[`${currentWorkflow.name}-step-0`],
                            elementPositions[`${currentWorkflow.name}-step-1`]
                          )}
                          // Active if role uses this path and step 1 is the target
                          isActive={selectedRoleIndex !== null && selectedRoleIndex < 2 && animatingSteps.length > 0 && animatingSteps[0] === 1}
                          serviceColor={currentWorkflow.color}
                        />
                      )}
                      
                      {(elementPositions[`${currentWorkflow.name}-step-1`] && elementPositions[`${currentWorkflow.name}-step-2`]) && (
                        <Connection
                          key="conn-step-1-2"
                          from="step-1" to="step-2"
                          delay={0.1}
                          path={calculateSmoothCurvePath(
                            elementPositions[`${currentWorkflow.name}-step-1`],
                            elementPositions[`${currentWorkflow.name}-step-2`]
                          )}
                          // Active if role uses this path and step 2 is the target
                          isActive={selectedRoleIndex !== null && selectedRoleIndex < 2 && animatingSteps.length > 0 && animatingSteps[0] === 2}
                          serviceColor={currentWorkflow.color}
                        />
                      )}
                      
                      {(elementPositions[`${currentWorkflow.name}-step-2`] && elementPositions[`${currentWorkflow.name}-step-5`]) && (
                        <Connection
                          key="conn-step-2-5"
                          from="step-2" to="step-5"
                          delay={0.1}
                          path={calculateSmoothCurvePath(
                            elementPositions[`${currentWorkflow.name}-step-2`],
                            elementPositions[`${currentWorkflow.name}-step-5`]
                          )}
                          // Active if role uses this path and step 5 is the target
                          isActive={selectedRoleIndex !== null && selectedRoleIndex < 2 && animatingSteps.length > 0 && animatingSteps[0] === 5}
                          serviceColor={currentWorkflow.color}
                        />
                      )}
                      
                      {/* Path 0→4→3→5 */}
                      {(elementPositions[`${currentWorkflow.name}-step-0`] && elementPositions[`${currentWorkflow.name}-step-4`]) && (
                        <Connection
                          key="conn-step-0-4"
                          from="step-0" to="step-4"
                          delay={0.1}
                          path={calculateSmoothCurvePath(
                            elementPositions[`${currentWorkflow.name}-step-0`],
                            elementPositions[`${currentWorkflow.name}-step-4`]
                          )}
                          // Active if role uses this path and step 4 is the target
                          isActive={selectedRoleIndex !== null && selectedRoleIndex >= 2 && animatingSteps.length > 0 && animatingSteps[0] === 4}
                          serviceColor={currentWorkflow.color}
                        />
                      )}
                      
                      {(elementPositions[`${currentWorkflow.name}-step-4`] && elementPositions[`${currentWorkflow.name}-step-3`]) && (
                        <Connection
                          key="conn-step-4-3"
                          from="step-4" to="step-3"
                          delay={0.1}
                          path={calculateSmoothCurvePath(
                            elementPositions[`${currentWorkflow.name}-step-4`],
                            elementPositions[`${currentWorkflow.name}-step-3`]
                          )}
                          // Active if role uses this path and step 3 is the target
                          isActive={selectedRoleIndex !== null && selectedRoleIndex >= 2 && animatingSteps.length > 0 && animatingSteps[0] === 3}
                          serviceColor={currentWorkflow.color}
                        />
                      )}
                      
                      {(elementPositions[`${currentWorkflow.name}-step-3`] && elementPositions[`${currentWorkflow.name}-step-5`]) && (
                        <Connection
                          key="conn-step-3-5"
                          from="step-3" to="step-5"
                          delay={0.1}
                          path={calculateSmoothCurvePath(
                            elementPositions[`${currentWorkflow.name}-step-3`],
                            elementPositions[`${currentWorkflow.name}-step-5`]
                          )}
                          // Active if role uses this path and step 5 is the target
                          isActive={selectedRoleIndex !== null && selectedRoleIndex >= 2 && animatingSteps.length > 0 && animatingSteps[0] === 5}
                          serviceColor={currentWorkflow.color}
                        />
                      )}
                      
                      {/* Connection from step 5 to chat - check positions exist */}
                      {(elementPositions[`${currentWorkflow.name}-step-5`] && elementPositions[`${currentWorkflow.name}-chat`]) && (
                        <Connection
                          key="conn-step-5-chat"
                          from="step-5" to="chat"
                          delay={0.1}
                          path={calculateSmoothCurvePath(
                            elementPositions[`${currentWorkflow.name}-step-5`],
                            elementPositions[`${currentWorkflow.name}-chat`]
                          )}
                          // Active if role is selected and step 5 is the target
                          isActive={selectedRoleIndex !== null && animatingSteps.length > 0 && animatingSteps[0] === 5}
                          serviceColor={currentWorkflow.color}
                        />
                      )}
                    </>
                  )}
              </div>
         </div>

         <motion.button
           className="mt-10 bg-xpectrum-purple hover:bg-xpectrum-darkpurple text-white px-7 py-3.5 rounded-full font-medium text-lg transition duration-300 shadow-sm hover:shadow-md"
           whileHover={{ scale: 1.03 }}
           whileTap={{ scale: 0.97 }}
         >
           Hire Xpectrum today
         </motion.button>
       </motion.div>

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