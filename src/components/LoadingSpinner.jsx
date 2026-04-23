import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        </div>
    );
};

export default LoadingSpinner;
