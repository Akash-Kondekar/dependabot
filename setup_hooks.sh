#!/bin/bash

# Define the directories
HOOKS_DIR=git_hooks
GIT_HOOKS_DIR=.git/hooks

# Check if .git/hooks directory exists
if [ ! -d "$GIT_HOOKS_DIR" ]; then
    echo "Error: $GIT_HOOKS_DIR directory not found. Are you in the root of a Git repository?"
    exit 1
fi

# Copy the hooks
cp -r $HOOKS_DIR/* $GIT_HOOKS_DIR/

# Make sure all hooks are executable
chmod +x $GIT_HOOKS_DIR/*

echo "Git hooks have been set up."
