# SINGHA ROY ENTERPRISE - Bill Generator

A modern, high-performance web application designed for **SINGHA ROY ENTERPRISE** to streamline the billing process. This application allows the user to generate professional bills by filling in order details, calculating prices, and applying taxes automatically.

## 🚀 Key Features

- **Dynamic Order Table**: Easily add, edit, and remove items from the billing list.
- **Automated Calculations**: Instant calculation of unit prices, sub-totals, taxes (GST/VAT), and grand totals.
- **Modern Interface**: A clean, responsive dashboard designed for professional use.
- **Client Management**: Quick entry for client details and billing information.
- **Export Ready**: Optimized for generating print-ready bills (PDF support coming soon).

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Package Manager**: [Bun](https://bun.sh/) (Recommended)

## 📦 Getting Started

### Prerequisites

Ensure you have [Bun](https://bun.sh/) installed on your machine. Alternatively, you can use `npm` or `yarn`.

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/singha-roy-enterprise-bill-gen.git
    cd singha-roy-enterprise-bill-gen
    ```

2. **Install dependencies**:
    ```bash
    bun install
    ```

### Development

Run the development server:

```bash
bun dev
```

The application will be available at `http://localhost:5173`.

### Build

Create a production-ready build:

```bash
bun build
```

The output will be in the `dist` folder.

### Formatting & Linting

Keep the code clean:

```bash
bun format  # Prettier
bun lint    # ESLint
```

## 📂 Project Structure

- `src/components`: Reusable UI components (shadcn/ui).
- `src/features`: Core billing logic and state management.
- `src/hooks`: Custom React hooks for calculations.
- `src/utils`: Helper functions for currency formatting and tax calculations.

## 📄 License

Internal use only for **SINGHA ROY ENTERPRISE**.
