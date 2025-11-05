#!/usr/bin/env python3
"""
FarmCare Pro - Livestock Health Management System
Complete Unified Application

Features:
• AI-powered disease prediction
• User accounts & authentication  
• Animal & farm land management
• Dashboard & analytics
• Prediction history
• Veterinarian directory
• Full farm management suite
"""

import os
import sys

def show_banner():
    print("=" * 60)
    print("🐾 FarmCare Pro - Complete Livestock Health Management")
    print("=" * 60)
    print()
    print("✨ All-in-One Features:")
    print("   • AI Disease Prediction")
    print("   • User Accounts & Profiles")
    print("   • Animal Management")
    print("   • Farm Land Tracking")
    print("   • Dashboard & Analytics")
    print("   • Veterinarian Directory")
    print("   • Prediction History")
    print()

def main():
    show_banner()
    
    try:
        print("🚀 Starting FarmCare Pro Complete System...")
        print("📱 Opening http://localhost:5000 in your browser...")
        print("👤 First time? Register a new account to access all features!")
        print("🔄 Press Ctrl+C to stop the server")
        print()
        
        os.system('python app.py')
        
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Thank you for using FarmCare Pro!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error starting application: {e}")
        print("💡 Make sure you have installed all requirements:")
        print("   pip install -r requirements.txt")
        input("Press Enter to exit...")

if __name__ == '__main__':
    main()