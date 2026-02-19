import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const ScrollToTop = ({ exclude = [], smooth = true, offset = 0 }) => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Check if current path is excluded
        const isExcluded = exclude.some(path => {
            if (path.includes('*')) {
                const base = path.replace('*', '');
                return pathname.startsWith(base);
            }
            return pathname === path;
        });

        if (!isExcluded) {
            window.scrollTo({
                top: offset,
                left: 0,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }, [pathname, exclude, smooth, offset]);

    return null;
};

ScrollToTop.propTypes = {
    exclude: PropTypes.arrayOf(PropTypes.string),
    smooth: PropTypes.bool,
    offset: PropTypes.number,
};

export default ScrollToTop;
