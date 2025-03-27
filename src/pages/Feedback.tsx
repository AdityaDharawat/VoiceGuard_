import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiMessageSquare, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import axios from 'axios';
import React from 'react';

const Feedback = () => {
    const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'suggestion'>('general');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [rating, setRating] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate submission
        try {
        const response = await axios.post('http://127.0.0.1:5000/api/feedback', {
            feedbackType,
            message,
            rating
        });

        console.log(response.data); // Debugging
        setSubmitted(true); // Show the success message

        } catch (error) {
        console.error("Error submitting feedback:", error);
        }
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    };

    return (
        <div className="container mx-auto px-4 pt-28 py-12">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold mb-8 dark:text-white"
            >
                Feedback & Community
            </motion.h1>

            {submitted ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 dark:text-white">Thank You!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Your feedback has been submitted successfully.</p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Submit Another
                    </button>
                </motion.div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-center mb-4">
                        <FiMessageSquare className="text-blue-500 mr-2" />
                        <h2 className="text-xl font-semibold dark:text-white">Feedback Form</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Feedback Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFeedbackType('general')}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        feedbackType === 'general' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    General
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFeedbackType('bug')}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        feedbackType === 'bug' 
                                            ? 'bg-red-600 text-white' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    Bug Report
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFeedbackType('suggestion')}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        feedbackType === 'suggestion' 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    Suggestion
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Your Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 min-h-[120px]"
                                placeholder="Describe your feedback..."
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Rating</label>
                            <div className="flex items-center space-x-2">
                                <FiThumbsDown 
                                    className={`w-6 h-6 cursor-pointer ${
                                        rating !== null && rating < 3 ? 'text-red-500' : 'text-gray-400'
                                    }`}
                                    onClick={() => setRating(1)}
                                />
                                <FiThumbsUp 
                                    className={`w-6 h-6 cursor-pointer ${
                                        rating !== null && rating >= 3 ? 'text-green-500' : 'text-gray-400'
                                    }`}
                                    onClick={() => setRating(5)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <FiSend className="mr-2" /> Submit Feedback
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Feedback;