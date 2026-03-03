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
export const itemVariants : Variants = {
    hidden: {
        opacity: 0,
        y: 30 // Bắt đầu thấp hơn vị trí thực tế 30px
    },
    visible: {
        opacity: 1,
        y: 0, // Di chuyển về vị trí gốc
        transition: {
            type: "spring", // Dùng kiểu spring để chuyển động tự nhiên hơn
            stiffness: 100, // Độ cứng của lò xo
            damping: 15, // Độ giảm chấn
            duration: 0.6 // Tổng thời gian chạy hiệu ứng
        }
    },
};