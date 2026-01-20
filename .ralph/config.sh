#!/bin/bash
#
# Ralph Wiggum Configuration
# Strict settings for controlled AI development loops
#

#######################################
# ITERATION LIMITS (STRICT)
#######################################

# Maximum number of iterations before stopping
# Keep this low to prevent runaway loops
MAX_ITERATIONS=20

# Maximum time in seconds (2 hours = 7200)
MAX_TIME_SECONDS=7200

# Cooldown between iterations (rate limit protection)
# Prevents hitting API rate limits
COOLDOWN_SECONDS=30

#######################################
# COMPLETION SETTINGS
#######################################

# The marker Claude must output when task is complete
# Must be unique and unlikely to appear accidentally
COMPLETION_MARKER="<RALPH_TASK_COMPLETE>"

#######################################
# FILE PATHS
#######################################

# Main prompt file
PROMPT_FILE="${SCRIPT_DIR}/prompt.md"

# Strict rules file
RULES_FILE="${SCRIPT_DIR}/rules.md"

#######################################
# CLAUDE SETTINGS
#######################################

# Model to use (leave empty for default)
# Options: claude-sonnet-4-20250514, claude-opus-4-20250514
MODEL=""

# DANGER: Skip permission prompts for autonomous operation
# Only enable in isolated/sandboxed environments!
DANGEROUSLY_SKIP_PERMISSIONS="false"

#######################################
# SAFETY SETTINGS
#######################################

# Dry run mode - don't actually run Claude
DRY_RUN="false"

# Auto-commit changes after each iteration
AUTO_COMMIT="false"

# Create checkpoint branches
CREATE_CHECKPOINTS="true"

#######################################
# PROJECT-SPECIFIC SETTINGS
#######################################

# Portfolio project paths
CLIENT_DIR="${PROJECT_ROOT}/client"
COMPONENTS_DIR="${CLIENT_DIR}/src/components"
CONSTANTS_DIR="${CLIENT_DIR}/src/constants"

# Required checks before marking complete
REQUIRED_CHECKS=(
    "npm run build"      # Build must succeed
    "npm test -- --passWithNoTests"  # Tests must pass
)
