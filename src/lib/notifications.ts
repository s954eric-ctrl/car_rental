export type NotificationType = 'booking' | 'payment' | 'system' | 'agency' | 'promo';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionPath?: string;
};

export const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your Mercedes-Benz C300 rental with Gold Coast Fleets is confirmed for 2 Nov. Retrieval keycode GH-7841 is ready.',
    time: '2 min ago',
    read: false,
    actionLabel: 'View Handover Pass',
    actionPath: '/history',
  },
  {
    id: 'n2',
    type: 'payment',
    title: 'Payment Received',
    message: 'GH\u20B5 2,750 paid via MTN MoMo for your Toyota Land Cruiser Prado booking. Receipt sent to your email.',
    time: '1 hour ago',
    read: false,
    actionLabel: 'Download Receipt',
    actionPath: '/history',
  },
  {
    id: 'n3',
    type: 'agency',
    title: 'Dispatch Officer Assigned',
    message: 'Kofi Mensah from StarDrive Ghana has been assigned as your dispatch officer for Kotoka Airport T3 pickup.',
    time: '3 hours ago',
    read: false,
    actionLabel: 'Contact Officer',
    actionPath: '/history',
  },
  {
    id: 'n4',
    type: 'system',
    title: 'DVLA License Verified',
    message: 'Your driver\u2019s license has been successfully verified. You\u2019re cleared for self-drive rentals.',
    time: 'Yesterday',
    read: true,
    actionLabel: 'View Profile',
    actionPath: '/settings',
  },
  {
    id: 'n5',
    type: 'promo',
    title: 'Weekend Special \u2014 15% Off',
    message: 'Enjoy 15% off all SUV rentals this weekend. Limited to Greater Accra hubs. Tap to browse available vehicles.',
    time: 'Yesterday',
    read: true,
    actionLabel: 'Browse SUVs',
    actionPath: '/explore',
  },
  {
    id: 'n6',
    type: 'system',
    title: 'Grace Period Reminder',
    message: 'Your Honda CR-V rental includes a 2-hour complimentary grace period on return. No late fees until 4 PM.',
    time: '2 days ago',
    read: true,
    actionLabel: 'View Trip',
    actionPath: '/history',
  },
  {
    id: 'n7',
    type: 'agency',
    title: 'Partner Application Under Review',
    message: 'Your agency application for StarDrive Ghana Ltd is being reviewed by our compliance team. Expected response within 48 hours.',
    time: '3 days ago',
    read: true,
    actionLabel: 'Check Status',
    actionPath: '/onboarding',
  },
];
