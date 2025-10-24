// Splash screen functionality
let siteRevealed = false;
const WELCOME_MESSAGE_DELAY = 500;

// GitHub API integration for commit history
async function fetchCommits() {
    const commitsContent = document.getElementById('commits-content');
    const username = 'commended';
    
    try {
        // Fetch user's recent activity from multiple repos
        const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`);
        if (!response.ok) throw new Error('Failed to fetch commits');
        
        const events = await response.json();
        
        // Filter for push events and extract commits
        const commits = [];
        events.forEach(event => {
            if (event.type === 'PushEvent' && event.payload.commits) {
                event.payload.commits.forEach(commit => {
                    commits.push({
                        sha: commit.sha.substring(0, 7),
                        message: commit.message,
                        author: commit.author.name,
                        date: new Date(event.created_at),
                        repo: event.repo.name
                    });
                });
            }
        });
        
        if (commits.length === 0) {
            commitsContent.innerHTML = '<div class="error">No recent commits found</div>';
            return;
        }
        
        // Display commits
        commitsContent.innerHTML = commits.slice(0, 10).map(commit => `
            <div class="commit-item">
                <div>
                    <span class="commit-hash">${commit.sha}</span>
                    <span class="commit-message">${escapeHtml(commit.message)}</span>
                </div>
                <div>
                    <span class="commit-author">${escapeHtml(commit.author)}</span>
                    <span class="commit-date">${formatDate(commit.date)}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        commitsContent.innerHTML = '<div class="error">Error loading commits. Using mock data...</div>';
        // Fallback to mock data
        displayMockCommits();
    }
}

function displayMockCommits() {
    const commitsContent = document.getElementById('commits-content');
    const mockCommits = [
        { sha: 'a1b2c3d', message: 'Initial commit', author: 'commended', date: new Date() },
        { sha: 'e4f5g6h', message: 'Add terminal styling', author: 'commended', date: new Date(Date.now() - 3600000) },
        { sha: 'i7j8k9l', message: 'Implement commit history module', author: 'commended', date: new Date(Date.now() - 7200000) },
        { sha: 'm0n1o2p', message: 'Add kitty ASCII art', author: 'commended', date: new Date(Date.now() - 10800000) },
        { sha: 'q3r4s5t', message: 'Create terminal interface', author: 'commended', date: new Date(Date.now() - 14400000) },
    ];
    
    commitsContent.innerHTML = mockCommits.map(commit => `
        <div class="commit-item">
            <div>
                <span class="commit-hash">${commit.sha}</span>
                <span class="commit-message">${escapeHtml(commit.message)}</span>
            </div>
            <div>
                <span class="commit-author">${escapeHtml(commit.author)}</span>
                <span class="commit-date">${formatDate(commit.date)}</span>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
}

// Terminal functionality
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');

const commands = {
    help: {
        description: 'Show available commands',
        execute: () => {
            return Object.keys(commands).map(cmd => 
                `  ${cmd.padEnd(15)} - ${commands[cmd].description}`
            ).join('\n');
        }
    },
    about: {
        description: 'About me',
        execute: () => {
            return `Hi! I'm commended, a developer who loves creating cool stuff.\nCheck out my socials and projects!`;
        }
    },
    socials: {
        description: 'Show social links',
        execute: () => {
            return `Instagram: @03ur\nGitHub: @commended\nTikTok: @immo`;
        }
    },
    clear: {
        description: 'Clear terminal',
        execute: () => {
            terminalOutput.innerHTML = '';
            return null;
        }
    },
    date: {
        description: 'Show current date and time',
        execute: () => {
            return new Date().toString();
        }
    },
    echo: {
        description: 'Echo text back',
        execute: (args) => {
            return args.join(' ');
        }
    },
    whoami: {
        description: 'Display current user',
        execute: () => {
            return 'commended';
        }
    },
    ls: {
        description: 'List files',
        execute: () => {
            return 'socials.sh  git_commits.log  kitty.art  terminal.sh';
        }
    },
    cat: {
        description: 'Display file contents',
        execute: (args) => {
            if (args.length === 0) return 'cat: missing file operand';
            const file = args[0];
            if (file === 'socials.sh') return 'Instagram: @03ur\nGitHub: @commended\nTikTok: @immo';
            if (file === 'kitty.art') return '   /\\_/\\\n  ( o.o )\n   > ^ <\n  /|   |\\\n (_|   |_)';
            return `cat: ${file}: No such file or directory`;
        }
    },
    welcome: {
        description: 'Show welcome message',
        execute: () => {
            return `Welcome to commended's terminal portfolio!\nType 'help' to see available commands.`;
        }
    }
};

function addOutput(text, className = 'response-line') {
    const lines = text.split('\n');
    lines.forEach(line => {
        const div = document.createElement('div');
        div.className = `output-line ${className}`;
        div.textContent = line;
        terminalOutput.appendChild(div);
    });
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function addCommand(command) {
    const div = document.createElement('div');
    div.className = 'output-line command-line';
    div.textContent = `$ ${command}`;
    terminalOutput.appendChild(div);
}

function executeCommand(input) {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    addCommand(input);
    
    if (command === '') {
        return;
    }
    
    if (commands[command]) {
        const result = commands[command].execute(args);
        if (result !== null) {
            addOutput(result);
        }
    } else {
        addOutput(`Command not found: ${command}. Type 'help' for available commands.`, 'error-line');
    }
}

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = terminalInput.value;
        terminalInput.value = '';
        executeCommand(input);
    }
});

// Auto-focus terminal input
document.querySelector('.terminal-module').addEventListener('click', () => {
    terminalInput.focus();
});

// Splash screen reveal function
function revealSite() {
    if (!siteRevealed) {
        siteRevealed = true;
        const splashScreen = document.getElementById('splash-screen');
        const container = document.querySelector('.container');
        
        splashScreen.style.display = 'none';
        container.classList.remove('hidden');
        
        // Initialize after revealing
        fetchCommits();
        terminalInput.focus();
        
        // Show welcome message with a small delay
        setTimeout(() => {
            addOutput('Welcome to commended\'s terminal portfolio!');
            addOutput('Type \'help\' to see available commands.\n');
        }, WELCOME_MESSAGE_DELAY);
    }
}

// Listen for Enter key on splash screen
document.addEventListener('keydown', (e) => {
    if (!siteRevealed && e.key === 'Enter') {
        revealSite();
    }
});
