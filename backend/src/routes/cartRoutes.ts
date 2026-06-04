import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    checkoutCart,
} from "../controllers/cartController";

const router = Router();

// Tất cả cart routes đều yêu cầu đăng nhập
router.use(authenticate);

router.get("/", getCart);                          // Lấy giỏ hàng
router.post("/items", addToCart);                  // Thêm sản phẩm
router.put("/items/:productId", updateCartItem);   // Cập nhật số lượng
router.delete("/items/:productId", removeCartItem);// Xoá 1 sản phẩm
router.delete("/", clearCart);                     // Xoá toàn bộ giỏ
router.post("/checkout", checkoutCart);            // Đặt hàng từ giỏ

export default router;
