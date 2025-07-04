#!/bin/bash

# Set terminal size and title
printf '\033]0;Docki CLI Demo\007'

# Colors
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

echo -e "${CYAN}🚀 Docki CLI Demo${NC}"
echo -e "${YELLOW}Adding JSDoc comments to TypeScript files${NC}"
echo ""
sleep 2

echo -e "${BLUE}📁 Demo files in our project:${NC}"
echo -e "${GREEN}$ ls demo-files/${NC}"
ls demo-files/
echo ""
sleep 2

echo -e "${BLUE}📋 Let's look at our TypeScript file without docstrings:${NC}"
echo -e "${GREEN}$ cat demo-files/utils.ts${NC}"
cat demo-files/utils.ts
echo ""
sleep 3

echo -e "${YELLOW}🔧 Now let's run docki to add docstrings:${NC}"
echo -e "${GREEN}$ docki${NC}"
sleep 2

# Change to demo-files directory and run docki
cd demo-files
../node_modules/.bin/ts-node ../src/index.ts
