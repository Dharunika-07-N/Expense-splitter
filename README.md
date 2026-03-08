# NexSplit - Smart Expense Splitter 💰

A premium, gamified expense splitting application that optimally manages your group's bills and minimizes debt settlements using advanced algorithms.

## ✨ Key Features
- **🚀 Zero-Type Entry**: Import friends quickly or use smart quick-picks.
- **🎮 Gamified & Premium UI**: Stunning and interactive design using Framer Motion animations, glassmorphism aesthetics, and native-feeling interactions.
- **🧙‍♂️ 4-Step Wizard Flow**: An intuitive, structured approach to logging expenses (Total Figure > Context > Split Engine > Confirmation).
- **📸 Receipt Scan Simulation**: Upload an image of your bill to instantly parse key items and start an itemized split.
- **🧮 Intelligent Debt Simplification**: Reduces the number of necessary payback transactions using a greedy matching algorithm across all active group balances.
- **� Shareable Summaries**: Export beautiful settlement reports directly as high-resolution images to share via chat apps.
- **💾 Local Persistence**: All data is securely saved locally on your device for lightning-fast, offline access.

## 🔀 Splitting Logic & Algorithms Explained

NexSplit features a robust "Split Engine" tailored for all real-world group scenarios:

1. **Equal Split (`Divide`)**
   - The total expense is divided evenly among all selected participants.
   - *Logic:* To prevent floating-point loss (e.g., 100 split 3 ways), the algorithm mathematically assigns an exact rounded amount to everyone, giving the last person any fractional remainder to ensure the sum exactly matches the total expense.

2. **Exact / Unequal Split (`Exact`)**
   - Perfect for when you know exactly who owes what amount safely down to the decimal.
   - *Logic:* The app strictly validates the amounts entered. If the final assigned amount sum doesn't match the total, or significantly exceeds it, it prompts users exactly who overpaid or underpaid to ensure zero errors.

3. **Percentage Split (`Pct`)**
   - Ideal for proportional splits (e.g., 60% / 40%).
   - *Logic:* Validates that the sum of all percentages precisely equals 100%. Converts the respective percentage into the exact currency cut from the main total before logging the transaction.

4. **Itemized / Tab Split (`Tab`)**
   - The absolute best mode for restaurant bills where people only pay for what they ate or drank.
   - *Logic:* Create individual line items (e.g., "Main Course", "Beverages") and tag specific friends to those items. The cost of each specific item is split equally only among the tagged participants. NexSplit aggregates these sub-splits into a final payload for everyone.

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Logic**: Pure JavaScript (Greedy Debt Simplification & Dynamic Splitting)
- **Export**: html2canvas
- **Search**: Fuse.js

## 📦 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📱 Mobile Usage
For the best experience (including the **Contact Picker API**), use the app on a modern mobile browser like Chrome on Android or Safari on iOS.

## 📝 License
MIT
