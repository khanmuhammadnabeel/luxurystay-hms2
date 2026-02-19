import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const PageTransition = ({
    children,
    variant = 'fade',
    duration = 0.4,
    skeleton = false
}) => {
    const location = useLocation();

    const variants = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        slide: {
            initial: { x: 20, opacity: 0 },
            animate: { x: 0, opacity: 1 },
            exit: { x: -20, opacity: 0 },
        },
        scale: {
            initial: { scale: 0.95, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 1.05, opacity: 0 },
        },
    };

    const selectedVariant = variants[variant] || variants.fade;

    // Optional Skeleton during transition (simplified)
    if (skeleton) {
        // In a real app, you might show a generic loading state here 
        // if the route children are lazy-loaded and not ready.
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={selectedVariant}
                transition={{
                    duration,
                    ease: "easeInOut"
                }}
                className="flex-1 w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

PageTransition.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['fade', 'slide', 'scale', 'custom']),
    duration: PropTypes.number,
    skeleton: PropTypes.bool,
};

export default PageTransition;
