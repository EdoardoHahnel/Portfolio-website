#!/usr/bin/env python3
"""
Scheduled News Updater - Runs daily to update news database
Can be run as a cron job or scheduled task
"""

import schedule
import time
import subprocess
import sys
import os
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('news_updater.log'),
        logging.StreamHandler()
    ]
)

def run_news_update():
    """Run the news scraper and update database"""
    try:
        logging.info("🔄 Starting scheduled news update...")
        
        # Run the real news scraper
        result = subprocess.run([
            sys.executable, 'real_news_scraper.py'
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            logging.info("✅ News update completed successfully")
            logging.info(f"Output: {result.stdout}")
        else:
            logging.error(f"❌ News update failed: {result.stderr}")
            
    except Exception as e:
        logging.error(f"❌ Error running news update: {e}")

def setup_schedule():
    """Set up the daily schedule"""
    # Update news every day at 6 AM
    schedule.every().day.at("06:00").do(run_news_update)
    
    # Also update every 6 hours during business hours
    schedule.every().day.at("09:00").do(run_news_update)
    schedule.every().day.at("15:00").do(run_news_update)
    schedule.every().day.at("21:00").do(run_news_update)
    
    logging.info("📅 News updater scheduled:")
    logging.info("   - Daily at 06:00")
    logging.info("   - Every 6 hours: 09:00, 15:00, 21:00")

def main():
    """Main scheduler loop"""
    logging.info("🚀 Starting News Scheduler")
    logging.info("=" * 50)
    
    # Run initial update
    run_news_update()
    
    # Set up schedule
    setup_schedule()
    
    logging.info("⏰ Scheduler running... Press Ctrl+C to stop")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        logging.info("🛑 Scheduler stopped by user")
    except Exception as e:
        logging.error(f"❌ Scheduler error: {e}")

if __name__ == "__main__":
    main()
