import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import agreement_en from '@/assets/agreement_en.md?raw';

const AgreementPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('Agreement');

    useEffect(() => {
        let markdown = agreement_en;
        
        markdown = markdown.replace(/{{GROUP_NAME}}/g, groupId || 'the group');
        markdown = markdown.replace(/{{COMPANY_NAME}}/g, 'Segula');
        
        const titleMatch = markdown.match(/title: "([^"]+)"/);
        const extractedTitle = titleMatch ? titleMatch[1] : 'Agreement';
        setTitle(extractedTitle);
        document.title = extractedTitle;
        
        markdown = markdown.replace(/---(.|\n)*?---/, '');
        setContent(markdown);
    }, [groupId]);
    
    return (
        <div className="min-h-screen bg-[#f4f7f9]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <img src="/brand_assets/svg/Color logo - no background.svg" alt="Segula Logo" className="h-10 w-auto" />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        <article className="prose prose-lg prose-indigo bg-white p-8 rounded-lg shadow-sm max-w-none">
                            <h1 className="text-center">{title}</h1>
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </article>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default AgreementPage; 