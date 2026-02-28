import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { X, Send, User, Mail, Phone, Building2, MessageSquare, CheckCircle2 } from 'lucide-react'
import api from '../services/api'

export default function ContactModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        details: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Call the backend API
            await api.post('/auth/contact', formData);

            setIsSubmitting(false);
            setIsSuccess(true);

            // Auto close after 3 seconds
            setTimeout(() => {
                onClose();
                // Reset after closing
                setTimeout(() => {
                    setIsSuccess(false);
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        details: ''
                    });
                }, 300);
            }, 3000);
        } catch (err) {
            console.error('Failed to send contact inquiry:', err);
            setError(err.response?.data?.error || 'Failed to send message. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <Transition grow show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all border border-blue-100">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent"
                                    >
                                        Get in Touch
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>

                                {isSuccess ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-900">Message Sent!</h4>
                                        <p className="text-gray-600">
                                            Thank you for contacting us. Our admin team will get back to you shortly.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && (
                                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
                                                {error}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Name */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        required
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder="John Doe"
                                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        required
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="john@example.com"
                                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Phone */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700 ml-1">Contact Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        required
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="+1 (555) 000-0000"
                                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Company */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700 ml-1">Company Name</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        required
                                                        type="text"
                                                        name="company"
                                                        value={formData.company}
                                                        onChange={handleChange}
                                                        placeholder="Sky Tech Inc."
                                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700 ml-1">Message Details</label>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                <textarea
                                                    required
                                                    name="details"
                                                    value={formData.details}
                                                    onChange={handleChange}
                                                    placeholder="How can we help you? Tell us about your requirements..."
                                                    rows={4}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-900 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>

                                        <p className="text-center text-xs text-gray-500 mt-4">
                                            By submitting this form, you agree to our
                                            <span className="text-blue-600 cursor-pointer hover:underline mx-1">Privacy Policy</span>
                                            and <span className="text-blue-600 cursor-pointer hover:underline mx-1">Terms of Service</span>.
                                        </p>
                                    </form>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
