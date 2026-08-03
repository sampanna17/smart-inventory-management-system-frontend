<div align="center">
  <img src="https://github.com/sampanna17/smart-inventory-management-system-frontend/blob/main/public/SIMS_LOGO_ICON.png" alt="SIMS Logo" width="80"/>
  <h1>📦 SIMS - Smart Inventory Management System</h1>
  <p>A modern, enterprise-grade inventory management frontend built with Angular 21 & Tailwind CSS.</p>

  <div>
    <img src="https://img.shields.io/badge/Angular-21.2.0-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vitest-4.0-729B1B?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  </div>
</div>

---

## ✨ Overview

**SIMS (Smart Inventory Management System)** is a robust, highly responsive, and user-friendly web application designed to streamline inventory operations. Built with a focus on performance and enterprise architecture, it provides real-time insights, efficient tracking, and seamless management of stock, orders, and suppliers.

## 🚀 Key Features

- **📊 Interactive Dashboard:** Real-time analytics, stock alerts, and quick insights at a glance.
- **📦 Inventory Tracking:** Add, edit, track, and manage product inventory seamlessly.
- **🏷️ Supplier Management:** Keep track of supplier details, purchase histories, and contacts.
- **🔄 Order Processing:** End-to-end management of sales and purchase orders.
- **⚡ Blazing Fast Performance:** Leveraging Angular 21, Server-Side Rendering (SSR), and optimized change detection.
- **🎨 Beautiful UI/UX:** Crafted with Tailwind CSS v4 and modern design principles.
- **📱 Fully Responsive:** Works flawlessly across desktops, tablets, and mobile devices.

## 🛠️ Tech Stack

- **Framework:** [Angular 21](https://angular.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [@ng-icons/heroicons](https://ng-icons.github.io/ng-icons/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Testing:** [Vitest](https://vitest.dev/)
- **SSR/Pre-rendering:** Angular Universal / `@angular/ssr`

## 📂 Project Structure

Following Enterprise Architecture guidelines, the project is structured for scalability and maintainability:

```text
src/
├── app/
│   ├── core/          # Singleton services, interceptors, guards
│   ├── shared/        # Reusable components, directives, pipes, models
│   ├── features/      # Feature modules (Dashboard, Inventory, Orders, etc.)
│   └── app.config.ts  # Application configuration & routing
├── assets/            # Static assets (images, fonts)
├── styles/            # Global styles and Tailwind configuration
└── environments/      # Environment-specific variables
```

## 🏃‍♂️ Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- Node.js (v20 or higher recommended)
- Yarn package manager (`yarn@1.22.x`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd sims
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn start
   # or
   ng serve
   ```
   Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

### Other Commands

- **Build for Production:**
  ```bash
  yarn build
  ```
- **Run Unit Tests (Vitest):**
  ```bash
  yarn test
  ```
- **Serve SSR Locally:**
  ```bash
  yarn serve:ssr:sims
  ```

## 🎨 Design System

This project uses **Tailwind CSS v4** as its core design engine. We adhere to a strict utility-first approach while maintaining custom abstract classes for highly reusable UI components (like buttons, cards, and inputs) to ensure consistency and cleaner HTML.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---

<div align="center">
  <sub>Built with hard work for better inventory management</sub>
</div>
