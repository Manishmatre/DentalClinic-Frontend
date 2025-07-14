/**
 * Mock data for admin profiles with India-specific information
 */

const adminMockData = {
  // Admin profile mock data
  profile: {
    // Personal information
    firstName: "Rajesh",
    lastName: "Sharma",
    email: "rajesh.sharma@healthclinic.in",
    phone: "+91 98765 43210",
    gender: "male",
    dateOfBirth: "1985-04-15",
    address: {
      street: "42 Nehru Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India"
    },
    profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
    
    // Professional information
    designation: "Clinic Administrator",
    department: "Administration",
    employeeId: "ADM-2023-001",
    joinDate: "2020-06-01",
    education: [
      {
        degree: "MBA in Healthcare Management",
        institution: "Indian Institute of Management, Ahmedabad",
        year: "2015"
      },
      {
        degree: "Bachelor of Commerce",
        institution: "University of Mumbai",
        year: "2007"
      }
    ],
    certifications: [
      {
        name: "Healthcare Administration Certification",
        issuedBy: "Indian Medical Association",
        year: "2018",
        expiryDate: "2024-12-31"
      },
      {
        name: "Digital Health Management",
        issuedBy: "National Health Portal of India",
        year: "2021",
        expiryDate: "2026-05-30"
      }
    ],
    
    // Bank accounts (India-specific banks)
    bankAccounts: [
      {
        bankName: "State Bank of India",
        accountNumber: "3456789012345",
        accountType: "Savings",
        routingNumber: "SBIN0001234",
        accountHolderName: "Rajesh Sharma",
        branch: "Andheri East Branch",
        isDefault: true
      },
      {
        bankName: "HDFC Bank",
        accountNumber: "5678901234567",
        accountType: "Current",
        routingNumber: "HDFC0002345",
        accountHolderName: "Rajesh Sharma",
        branch: "Bandra West Branch",
        isDefault: false
      },
      {
        bankName: "ICICI Bank",
        accountNumber: "7890123456789",
        accountType: "Savings",
        routingNumber: "ICIC0003456",
        accountHolderName: "Rajesh Sharma",
        branch: "Powai Branch",
        isDefault: false
      }
    ],
    
    // Payment methods (India-specific)
    paymentMethods: [
      {
        type: "credit",
        cardNumber: "4123456789012345",
        nameOnCard: "RAJESH SHARMA",
        expiryDate: "09/26",
        cvv: "123",
        cardType: "Visa",
        isDefault: true,
        billingAddress: {
          street: "42 Nehru Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India"
        }
      },
      {
        type: "debit",
        cardNumber: "5123456789012345",
        nameOnCard: "RAJESH SHARMA",
        expiryDate: "11/25",
        cvv: "456",
        cardType: "RuPay",
        isDefault: false,
        billingAddress: {
          street: "42 Nehru Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India"
        }
      },
      {
        type: "upi",
        upiId: "rajesh.sharma@okicici",
        phoneNumber: "+919876543210",
        isDefault: false
      }
    ],
    
    // Social links
    socialLinks: [
      {
        platform: "LinkedIn",
        url: "https://www.linkedin.com/in/rajesh-sharma-healthcare",
        isPublic: true
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/rajesh_healthcare",
        isPublic: true
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/rajesh.sharma.healthcare",
        isPublic: false
      },
      {
        platform: "Instagram",
        url: "https://instagram.com/rajesh.healthcare",
        isPublic: false
      }
    ],
    
    // Clinic details
    clinicDetails: {
      name: "HealthFirst Multispecialty Clinic",
      logo: "https://placehold.co/400x200?text=HealthFirst+Logo",
      address: {
        street: "15 Gandhi Road",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India"
      },
      contactNumber: "+91 22 2345 6789",
      email: "info@healthfirst.in",
      website: "https://www.healthfirst.in",
      registrationNumber: "HC-MH-2020-56789",
      taxIdentificationNumber: "GSTIN-27AABCU9603R1ZX",
      establishedYear: "2015",
      operatingHours: [
        { day: "Monday", open: "09:00", close: "20:00" },
        { day: "Tuesday", open: "09:00", close: "20:00" },
        { day: "Wednesday", open: "09:00", close: "20:00" },
        { day: "Thursday", open: "09:00", close: "20:00" },
        { day: "Friday", open: "09:00", close: "20:00" },
        { day: "Saturday", open: "10:00", close: "18:00" },
        { day: "Sunday", open: "10:00", close: "14:00" }
      ],
      specialties: [
        "General Medicine",
        "Pediatrics",
        "Orthopedics",
        "Gynecology",
        "Dermatology",
        "Cardiology",
        "Ayurveda"
      ],
      facilities: [
        "Laboratory",
        "X-Ray",
        "Ultrasound",
        "ECG",
        "Pharmacy",
        "Ambulance Service"
      ],
      insuranceAccepted: [
        "Star Health Insurance",
        "HDFC ERGO Health Insurance",
        "Bajaj Allianz Health Insurance",
        "Aditya Birla Health Insurance",
        "ICICI Lombard Health Insurance",
        "Ayushman Bharat"
      ],
      images: [
        "https://placehold.co/600x400?text=Clinic+Reception",
        "https://placehold.co/600x400?text=Waiting+Area",
        "https://placehold.co/600x400?text=Consultation+Room",
        "https://placehold.co/600x400?text=Laboratory"
      ]
    },
    
    // Notification preferences
    notificationPreferences: {
      email: {
        appointments: true,
        reminders: true,
        billing: true,
        marketing: false,
        systemUpdates: true
      },
      sms: {
        appointments: true,
        reminders: true,
        billing: false,
        marketing: false,
        systemUpdates: false
      },
      push: {
        appointments: true,
        reminders: true,
        billing: true,
        marketing: false,
        systemUpdates: true
      }
    },
    appointmentReminderTime: "24",
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    newsletterSubscription: true,
    healthTipsSubscription: false,
    appointmentDigest: true,
    
    // Activity log
    activityLog: [
      {
        action: "Updated clinic operating hours",
        timestamp: "2023-05-20T14:30:00Z",
        ipAddress: "103.25.xx.xx",
        device: "Chrome on Windows"
      },
      {
        action: "Added new insurance provider",
        timestamp: "2023-05-15T10:45:00Z",
        ipAddress: "103.25.xx.xx",
        device: "Chrome on Windows"
      },
      {
        action: "Updated profile information",
        timestamp: "2023-05-10T09:15:00Z",
        ipAddress: "103.25.xx.xx",
        device: "Chrome on Windows"
      },
      {
        action: "Changed password",
        timestamp: "2023-04-28T16:20:00Z",
        ipAddress: "103.25.xx.xx",
        device: "Safari on iPhone"
      },
      {
        action: "Added new payment method",
        timestamp: "2023-04-22T11:05:00Z",
        ipAddress: "103.25.xx.xx",
        device: "Chrome on Windows"
      }
    ]
  }
};

export default adminMockData;
