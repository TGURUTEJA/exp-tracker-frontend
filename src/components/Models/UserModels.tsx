import { X } from "lucide-react";
import ProfileCard from "../UserProfileCard/UserProfileCard";

interface ModalType {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const UserModles = ({open,setOpen}: ModalType) => {
    
    return (<>
          {open && (
        <div
          className="
            fixed inset-0 z-[999]
            bg-black/40 backdrop-blur-sm
            flex items-center justify-center
            animate-fadeIn
          "
          onClick={() => setOpen(false)} // close on outside click
        >
          <div
            className="
              relative w-[90%] max-w-lg
              bg-slate-800 rounded-2xl
              border border-slate-700 
              p-6 shadow-xl 
              animate-slideUp
            "
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-slate-300 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <X size={22} />
            </button>

            {/* USER PROFILE CARD */}
            <ProfileCard />
          </div>
        </div>
      )}
    
    </>);
    
}
export default UserModles;
