import type {Variants} from "motion";

export const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            // Thời gian trễ giữa mỗi phần tử con xuất hiện
            staggerChildren: 0.3,
            // Bắt đầu hiệu ứng sau khi container xuất hiện 0.3s
            delayChildren: 0.3,
        },
    },
};

// 3. Định nghĩa biến thể cho từng phần tử con (Fade In Up)
export const fadeIn= (direction: "up" | "down" | "left" | "right"): Variants => ({
    hidden: {
        opacity: 0,
        x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
        y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
    },
    visible: {
        opacity: 1,
        y: 0,
        x: 0,// Di chuyển về vị trí gốc
        transition: {
            type: "tween", // Dùng kiểu spring để chuyển động tự nhiên hơn
            stiffness: 100, // Độ cứng của lò xo
            damping: 15, // Độ giảm chấn
            duration: 0.6 // Tổng thời gian chạy hiệu ứng
        }
    },
});


// 2. Hiệu ứng Fade Out (Ẩn dần) - Thường dùng cho AnimatePresence
export const fadeOut: Variants = {
    exit: {
        opacity: 0,
        transition: { duration: 0.3 }
    }
};

// 3. Hiệu ứng Nút bấm nảy (Tap & Hover)
// Lưu ý: Thường dùng trực tiếp với whileHover và whileTap thay vì variants
export const buttonPress = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

// 4. Hiệu ứng Trượt từ các hướng (Slide In)
export const slideIn = (direction: "up" | "down" | "left" | "right"): Variants => ({
    hidden: {
        x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
        y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
        opacity: 0,
    },
    visible: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            duration: 0.8,
            bounce: 0.3,
        },
    },
});