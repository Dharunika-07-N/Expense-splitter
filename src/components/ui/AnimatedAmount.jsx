import { useSpring, animated } from '@react-spring/web';

export default function AnimatedAmount({ value }) {
    const { num } = useSpring({ num: value, config: { tension: 120, friction: 20 } });
    return <animated.span>{num.to(n => `₹${n.toFixed(2)}`)}</animated.span>;
}
