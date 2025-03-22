import { Link } from "wouter";
import { 
  MapPin, 
  History, 
  BarChart2, 
  User 
} from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
}

const BottomNavigation = ({ activeTab }: BottomNavigationProps) => {
  return (
    <nav className="bg-white border-t border-neutral-200 fixed bottom-0 left-0 right-0 z-10 h-16">
      <div className="flex justify-around h-full">
        <Link href="/">
          <a className={`flex flex-col items-center justify-center w-1/4 ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'}`}>
            <MapPin className="w-5 h-5" />
            <span className="text-xs mt-1">Map</span>
          </a>
        </Link>
        
        <Link href="/history">
          <a className={`flex flex-col items-center justify-center w-1/4 ${activeTab === 'history' ? 'text-primary' : 'text-muted-foreground'}`}>
            <History className="w-5 h-5" />
            <span className="text-xs mt-1">History</span>
          </a>
        </Link>
        
        <Link href="/stats">
          <a className={`flex flex-col items-center justify-center w-1/4 ${activeTab === 'stats' ? 'text-primary' : 'text-muted-foreground'}`}>
            <BarChart2 className="w-5 h-5" />
            <span className="text-xs mt-1">Stats</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={`flex flex-col items-center justify-center w-1/4 ${activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}>
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
