import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    MapPin, 
    UploadCloud, 
    CheckCircle, 
    AlertTriangle, 
    ArrowLeft,
    FileText,
    Wand2,
    EyeOff
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
    uploadCivicEvidence, 
    submitCivicComplaint, 
    findNearbyDuplicate,
    addCommunitySupport
} from '../../services/civicService';
import { useCivicStore } from '../../store/useCivicStore';
import { auth } from '../../firebaseConfig';

// Fix for default Leaflet marker icons missing in build pipelines
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Structural validation parameters for the intake form
const reportSchema = z.object({
    title: z.string().min(5, "Title must contain at least 5 characters").max(100, "Title exceeds maximum length"),
    category: z.string().min(1, "Please select an operational category"),
    priority: z.enum(['Standard', 'High', 'Critical']),
    description: z.string().min(20, "Please provide a more detailed description (minimum 20 characters)"),
    isAnonymous: z.boolean().default(false)
});

// Geographic hash generator for proximity sorting
const generateGeohash = (latitude, longitude, precision = 7) => {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let isEven = true;
    let lat = [-90.0, 90.0];
    let lon = [-180.0, 180.0];
    let bit = 0;
    let ch = 0;
    let geohash = '';

    while (geohash.length < precision) {
        if (isEven) {
            const mid = (lon[0] + lon[1]) / 2;
            if (longitude > mid) {
                ch |= (1 << (4 - bit));
                lon[0] = mid;
            } else {
                lon[1] = mid;
            }
        } else {
            const mid = (lat[0] + lat[1]) / 2;
            if (latitude > mid) {
                ch |= (1 << (4 - bit));
                lat[0] = mid;
            } else {
                lat[1] = mid;
            }
        }
        isEven = !isEven;
        if (bit < 4) {
            bit++;
        } else {
            geohash += base32[ch];
            bit = 0;
            ch = 0;
        }
    }
    return geohash;
};

// Interactive map component to extract exact geographic coordinates
function LocationSelector({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position ? <Marker position={position} /> : null;
}

export default function ReportIssue() {
    const navigate = useNavigate();
    const saveDraft = useCivicStore((state) => state.saveDraft);
    
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [duplicateFound, setDuplicateFound] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            title: '',
            category: '',
            priority: 'Standard',
            description: '',
            isAnonymous: false
        }
    });

    const currentCategory = watch('category');
    const currentDescription = watch('description');

    // Automated duplicate detection protocol
    useEffect(() => {
        const checkDuplicates = async () => {
            if (selectedLocation && currentCategory) {
                const prefix = generateGeohash(selectedLocation[0], selectedLocation[1], 6);
                try {
                    const duplicates = await findNearbyDuplicate(prefix, currentCategory);
                    if (duplicates && duplicates.length > 0) {
                        setDuplicateFound(duplicates[0]);
                    } else {
                        setDuplicateFound(null);
                    }
                } catch (error) {
                    console.error("Proximity scan error:", error);
                }
            }
        };
        checkDuplicates();
    }, [selectedLocation, currentCategory]);

    // Automated text formatting protocol to ensure administrative clarity
    const enhanceDescription = () => {
        if (!currentDescription || currentDescription.length < 10) return;
        
        const structuredText = `OFFICIAL INCIDENT REPORT
Category: ${currentCategory || 'Unspecified'}
Priority Assessment: Pending Review
Details: ${currentDescription.charAt(0).toUpperCase() + currentDescription.slice(1)}

Please deploy necessary assessment personnel to evaluate the reported condition.`;
        
        setValue('description', structuredText);
    };

    const handleFileSelection = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEvidenceFile(e.target.files[0]);
        }
    };

    const processSubmission = async (data) => {
        if (!selectedLocation) {
            alert("Please identify the exact geographic location on the map before proceeding.");
            return;
        }

        setIsProcessing(true);

        try {
            let evidenceUrl = null;
            if (evidenceFile) {
                evidenceUrl = await uploadCivicEvidence(evidenceFile);
            }

            const activeUser = auth.currentUser;
            const finalPayload = {
                title: data.title,
                category: data.category,
                priority: data.priority,
                description: data.description,
                isAnonymous: data.isAnonymous,
                location: {
                    latitude: selectedLocation[0],
                    longitude: selectedLocation[1]
                },
                geohash: generateGeohash(selectedLocation[0], selectedLocation[1]),
                evidenceUrl: evidenceUrl,
                userId: data.isAnonymous ? 'ANONYMOUS_CITIZEN' : (activeUser ? activeUser.uid : 'UNREGISTERED_CITIZEN'),
                ward: 'Zone A', // Administrative sector assignment placeholder
            };

            await submitCivicComplaint(finalPayload);
            setSubmissionSuccess(true);
            
            setTimeout(() => {
                navigate('/civic');
            }, 3000);

        } catch (error) {
            console.error("Submission processing failed:", error);
            saveDraft(data);
            alert("Network transmission failed. Your report has been saved securely to local storage and will upload when connectivity is restored.");
            setIsProcessing(false);
        }
    };

    const handleSupportExisting = async () => {
        if (!duplicateFound) return;
        setIsProcessing(true);
        try {
            await addCommunitySupport(duplicateFound.id);
            setSubmissionSuccess(true);
            setTimeout(() => navigate('/civic'), 3000);
        } catch (error) {
            setIsProcessing(false);
        }
    };

    if (submissionSuccess) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
                <CheckCircle size={64} className="text-[#ffffff] mb-6" />
                <h1 className="text-[2.5rem] font-black tracking-tight mb-4 text-center">Report Transmitted</h1>
                <p className="text-[#888888] text-center max-w-[400px]">
                    The infrastructure deficiency has been successfully registered in the municipal database. Operations teams will be dispatched according to the assigned priority level.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden pt-24 pb-12">
            <div className="max-w-[1000px] mx-auto px-6 md:px-12">
                
                <button 
                    onClick={() => navigate('/civic')}
                    className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors mb-10 outline-none font-bold text-[0.9rem]"
                >
                    <ArrowLeft size={16} /> Return to Operations Portal
                </button>

                <div className="mb-12">
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                        Incident Report
                    </h1>
                    <p className="text-[#aaaaaa] text-[1.1rem]">
                        Complete the documentation below to notify administrative personnel of required infrastructure maintenance.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit(processSubmission)} className="flex flex-col gap-6">
                            
                            {/* Basic Details */}
                            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 md:p-8">
                                <h3 className="text-[1.2rem] font-black mb-6 flex items-center gap-2">
                                    <FileText size={20} /> Categorization
                                </h3>
                                
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-[0.85rem] font-bold text-[#888888] mb-2 uppercase tracking-wider">Report Title</label>
                                        <Controller
                                            name="title"
                                            control={control}
                                            render={({ field }) => (
                                                <input {...field} placeholder="Brief identification of the issue" className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]" />
                                            )}
                                        />
                                        {errors.title && <span className="text-red-500 text-[0.8rem] mt-1 block">{errors.title.message}</span>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[0.85rem] font-bold text-[#888888] mb-2 uppercase tracking-wider">Operational Category</label>
                                            <Controller
                                                name="category"
                                                control={control}
                                                render={({ field }) => (
                                                    <select {...field} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem] appearance-none">
                                                        <option value="">Select Division...</option>
                                                        <option value="Road Maintenance">Road Maintenance</option>
                                                        <option value="Sanitation Services">Sanitation Services</option>
                                                        <option value="Water Supply">Water Supply</option>
                                                        <option value="Electrical Grid">Electrical Grid</option>
                                                        <option value="Public Safety">Public Safety</option>
                                                    </select>
                                                )}
                                            />
                                            {errors.category && <span className="text-red-500 text-[0.8rem] mt-1 block">{errors.category.message}</span>}
                                        </div>

                                        <div>
                                            <label className="block text-[0.85rem] font-bold text-[#888888] mb-2 uppercase tracking-wider">Priority Level</label>
                                            <Controller
                                                name="priority"
                                                control={control}
                                                render={({ field }) => (
                                                    <select {...field} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem] appearance-none">
                                                        <option value="Standard">Standard Maintenance</option>
                                                        <option value="High">High Urgency</option>
                                                        <option value="Critical">Critical Hazard</option>
                                                    </select>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[0.85rem] font-bold text-[#888888] uppercase tracking-wider">Detailed Assessment</label>
                                            <button type="button" onClick={enhanceDescription} className="text-[0.8rem] font-bold text-[#aaaaaa] hover:text-white transition-colors flex items-center gap-1 outline-none">
                                                <Wand2 size={14} /> Structure Text
                                            </button>
                                        </div>
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <textarea {...field} rows="5" placeholder="Provide complete operational details regarding the deficiency..." className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem] resize-none"></textarea>
                                            )}
                                        />
                                        {errors.description && <span className="text-red-500 text-[0.8rem] mt-1 block">{errors.description.message}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Controls */}
                            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 md:p-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-[1.1rem] font-black flex items-center gap-2 mb-1">
                                        <EyeOff size={18} /> Anonymous Submission
                                    </h3>
                                    <p className="text-[0.85rem] text-[#888888]">Omit your personal identification from the public administrative record.</p>
                                </div>
                                <Controller
                                    name="isAnonymous"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={field.value} onChange={field.onChange} />
                                            <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffffff]"></div>
                                        </label>
                                    )}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isProcessing || duplicateFound !== null}
                                className="w-full bg-white text-black py-4 rounded-xl font-black text-[1rem] hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none mt-4"
                            >
                                {isProcessing ? 'Transmitting Data...' : 'Submit Incident Report'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-1 flex flex-col gap-6">
                        
                        {/* Duplicate Detection Warning */}
                        <AnimatePresence>
                            {duplicateFound && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-[#111111] border border-white rounded-2xl p-6 overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertTriangle size={24} className="text-white" />
                                        <h4 className="font-black text-[1.1rem]">Existing Incident Detected</h4>
                                    </div>
                                    <p className="text-[0.9rem] text-[#aaaaaa] mb-4">
                                        Administrative records indicate a similar deficiency ({duplicateFound.title}) is currently under review for this exact location. 
                                    </p>
                                    <button 
                                        onClick={handleSupportExisting}
                                        disabled={isProcessing}
                                        className="w-full bg-white text-black py-3 rounded-xl font-bold text-[0.9rem] hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
                                    >
                                        Register Community Support
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Location Picker */}
                        <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 flex flex-col h-[400px]">
                            <h3 className="text-[1.1rem] font-black mb-4 flex items-center gap-2 shrink-0">
                                <MapPin size={18} /> Geographic Location
                            </h3>
                            <div className="w-full flex-1 rounded-xl overflow-hidden border border-[#333333] relative z-0">
                                <MapContainer 
                                    center={[19.0760, 72.8777]} // Default coordinates
                                    zoom={13} 
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationSelector position={selectedLocation} setPosition={setSelectedLocation} />
                                </MapContainer>
                            </div>
                            <p className="text-[0.8rem] text-[#888888] mt-3 shrink-0 text-center font-bold">
                                Tap the map to designate the precise incident coordinates.
                            </p>
                        </div>

                        {/* Evidence Upload */}
                        <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6">
                            <h3 className="text-[1.1rem] font-black mb-4 flex items-center gap-2">
                                <UploadCloud size={18} /> Visual Evidence
                            </h3>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-[#333333] hover:border-white transition-colors rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer text-center"
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileSelection} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                                {evidenceFile ? (
                                    <>
                                        <CheckCircle size={28} className="text-white mb-2" />
                                        <span className="text-[0.9rem] font-bold text-white break-all">{evidenceFile.name}</span>
                                        <span className="text-[0.8rem] text-[#888888] mt-1">Ready for transmission</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={28} className="text-[#555555] mb-2" />
                                        <span className="text-[0.9rem] font-bold text-white">Select Documentation</span>
                                        <span className="text-[0.8rem] text-[#888888] mt-1">JPEG, PNG formats supported</span>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}