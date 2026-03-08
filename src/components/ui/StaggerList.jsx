import { motion } from 'framer-motion';

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } }
};
const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function StaggerList({ items, renderItem, className = '' }) {
    return (
        <motion.ul variants={containerVariants} initial="hidden" animate="show" className={className}>
            {items.map((item, index) => (
                <motion.li key={item.id || index} variants={itemVariants}>
                    {renderItem(item, index)}
                </motion.li>
            ))}
        </motion.ul>
    );
}
