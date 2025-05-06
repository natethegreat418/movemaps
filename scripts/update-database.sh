#!/bin/bash
# Script to update the database with validated location data

# Set up error handling
set -e

# Display help message
show_help() {
  echo "Usage: ./update-database.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --overwrite          Overwrite existing database entries"
  echo "  --skip-validation    Skip validation of trailer URLs"
  echo "  --use-validated      Use previously validated data (if available)"
  echo "  --help               Display this help message"
  echo ""
  echo "Examples:"
  echo "  ./update-database.sh --overwrite            # Validate and overwrite database"
  echo "  ./update-database.sh --use-validated        # Use existing validated data"
  echo "  ./update-database.sh --skip-validation      # Skip validation and use raw data"
}

# Parse command line arguments
OVERWRITE=""
SKIP_VALIDATION=""
USE_VALIDATED=""

for arg in "$@"; do
  case $arg in
    --overwrite)
      OVERWRITE="--overwrite"
      shift
      ;;
    --skip-validation)
      SKIP_VALIDATION="--skip-validation"
      shift
      ;;
    --use-validated)
      USE_VALIDATED="--use-validated"
      shift
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      show_help
      exit 1
      ;;
  esac
done

# Make sure we're in the project root directory
cd "$(dirname "$0")/.."

echo "===== MovieMap Database Update Tool ====="
echo "Starting the database update process..."

# Check for and warn about YouTube API key
if [ -z "$YOUTUBE_API_KEY" ] && [ -z "$SKIP_VALIDATION" ] && [ -z "$USE_VALIDATED" ]; then
  echo "⚠️  WARNING: YOUTUBE_API_KEY environment variable not set."
  echo "   Trailer validation will use fallback methods only."
  echo "   For better results, set this variable with your YouTube API key."
  echo "   Example: export YOUTUBE_API_KEY=your_api_key_here"
  echo ""
fi

# Run the import script with the provided options
echo "Running import script with options: $OVERWRITE $SKIP_VALIDATION $USE_VALIDATED"
node scripts/import-locations.js $OVERWRITE $SKIP_VALIDATION $USE_VALIDATED

echo "===== Database update complete! ====="