import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  // Features data
  features = [
    {
      icon: '👥',
      title: 'User Management',
      description:
        'Manage staff accounts, roles, permissions, and secure authentication for your team.',
      items: ['Admin & Staff Roles', 'Role-Based Access', 'Secure Login'],
    },
    {
      icon: '📦',
      title: 'Product Management',
      description:
        'Efficiently manage products, categories, pricing, and images with complete control.',
      items: ['Add/Update Products', 'Category Management', 'Product Images'],
    },
    {
      icon: '📊',
      title: 'Inventory Management',
      description:
        'Monitor stock levels, track movements, and maintain optimal inventory with alerts.',
      items: ['Real-time Stock', 'Stock Movement History', 'Low Stock Alerts'],
    },
    {
      icon: '💰',
      title: 'Sales Management',
      description: 'Process sales transactions, generate invoices, and track sales performance.',
      items: ['Sales Transactions', 'Invoice Generation', 'Sales Reports'],
    },
    {
      icon: '🛒',
      title: 'Purchase Management',
      description: 'Create purchase orders, manage suppliers, and track procurement efficiently.',
      items: ['Purchase Orders', 'Supplier Management', 'Purchase History'],
    },
    {
      icon: '👤',
      title: 'Customer Management',
      description: 'Maintain customer records, view purchase history, and manage relationships.',
      items: ['Customer Database', 'Purchase History', 'Customer Reports'],
    },
    {
      icon: '📈',
      title: 'Reports & Analytics',
      description: 'Generate comprehensive reports and analytics for informed business decisions.',
      items: ['Sales Reports', 'Inventory Reports', 'Revenue Analytics'],
    },
    {
      icon: '🔔',
      title: 'Notifications & Alerts',
      description:
        'Real-time notifications for stock alerts, sales confirmations, and system events.',
      items: ['Low Stock Alerts', 'Sales Notifications', 'System Alerts'],
    },
    {
      icon: '🛡️',
      title: 'Security Features',
      description: 'Robust security with role-based access, audit logs, and secure authentication.',
      items: ['Access Control', 'Audit Logs', 'Secure Authentication'],
    },
  ];

  // Stats data
  stats = [
    { label: 'Products Managed', value: '10K+' },
    { label: 'Daily Transactions', value: '500+' },
    { label: 'Active Users', value: '50+' },
    { label: 'Total Revenue', value: '$1M+' },
  ];

  // System benefits
  benefits = [
    {
      icon: '⚡',
      title: 'Real-time Updates',
      description: 'Track inventory changes instantly with real-time stock updates.',
    },
    {
      icon: '🔒',
      title: 'Secure & Reliable',
      description: 'Role-based access control and secure data storage.',
    },
    {
      icon: '📱',
      title: 'User-Friendly',
      description: 'Clean, modern interface designed for efficiency and ease of use.',
    },
    {
      icon: '📊',
      title: 'Data-Driven',
      description: 'Make informed decisions with powerful reporting and analytics.',
    },
  ];

  // Features for the CTA section
  ctaFeatures = [
    'Stock Management',
    'Sales Processing',
    'Invoice Generation',
    'User Access Control',
    'Real-time Reports',
    'Supplier Management',
  ];
}
