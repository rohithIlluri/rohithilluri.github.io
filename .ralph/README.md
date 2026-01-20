# Ralph Wiggum - Custom AI Development Loop

> "I'm helping!" - Ralph Wiggum

A personalized implementation of the Ralph Wiggum technique for autonomous AI-powered development on this portfolio project.

## What is Ralph Wiggum?

Ralph Wiggum is an iterative AI development loop that feeds Claude Code the same prompt repeatedly until task completion. Each iteration runs in a fresh context while file state persists, allowing the AI to read its own previous work and iteratively improve.

## Quick Start

```bash
# 1. Initialize a new task
./.ralph/ralph init

# 2. Edit the prompt file with your task
nano .ralph/prompt.md

# 3. Start the loop
./.ralph/ralph start

# Or dry-run first to test
./.ralph/ralph start --dry-run
```

## Commands

| Command | Description |
|---------|-------------|
| `ralph init` | Set up a new task |
| `ralph start` | Start the Ralph loop |
| `ralph start --dry-run` | Test without running Claude |
| `ralph start --max-iterations 10` | Override iteration limit |
| `ralph status` | Show current status |
| `ralph logs` | Show log files |
| `ralph help` | Show help |

## Configuration

Edit `.ralph/config.sh` to customize:

```bash
# Iteration limits
MAX_ITERATIONS=20        # Stop after N iterations
MAX_TIME_SECONDS=7200    # Stop after 2 hours
COOLDOWN_SECONDS=30      # Wait between iterations

# Completion marker
COMPLETION_MARKER="<RALPH_TASK_COMPLETE>"

# Claude settings
DANGEROUSLY_SKIP_PERMISSIONS="false"  # Enable for autonomous mode
```

## Files

```
.ralph/
├── ralph          # Main script
├── config.sh      # Configuration
├── rules.md       # Strict planning rules
├── prompt.md      # Your task prompt (edit this!)
├── README.md      # This file
└── logs/          # Iteration logs
```

## Strict Rules

This implementation enforces strict planning discipline:

1. **Planning First** - Must create TODO before coding
2. **One Step at a Time** - Complete tasks sequentially
3. **Verify Each Step** - Check work after changes
4. **Quality Gates** - Build must pass before completion
5. **Safety Limits** - Max iterations and time limits

See `rules.md` for the full ruleset.

## Writing Good Prompts

### DO:
```markdown
# Task: Add dark mode toggle to Hero section

## Requirements
- [ ] Add toggle button in top-right corner
- [ ] Use existing theme.js constants
- [ ] Persist preference to localStorage
- [ ] Smooth transition animation

## Success Criteria
- Toggle works correctly
- Build passes
- Responsive on mobile
```

### DON'T:
```markdown
Make the site look better with dark mode and stuff.
```

## Safety Considerations

### Rate Limiting
- 30-second cooldown between iterations
- Max 20 iterations by default
- 2-hour time limit

### Permissions
By default, `DANGEROUSLY_SKIP_PERMISSIONS` is **false**. This means Claude will ask for permission on each tool use.

For truly autonomous operation, set it to `true` BUT:
- Run in isolated environment
- Use minimal file access
- Review logs frequently

### Git Safety
- Never force pushes
- Creates checkpoint commits
- Changes are reversible

## Logs

Logs are saved to `.ralph/logs/`:
- `ralph-YYYYMMDD-HHMMSS.log` - Main log
- `iteration-N.log` - Individual iteration outputs

View logs:
```bash
./.ralph/ralph logs
cat .ralph/logs/ralph-*.log
```

## Troubleshooting

### Loop doesn't start
1. Check Claude Code is installed: `which claude`
2. Verify prompt.md exists
3. Try `ralph status`

### Loop runs forever
1. Check completion marker matches
2. Verify success criteria in prompt
3. Reduce MAX_ITERATIONS
4. Check rules aren't too strict

### Claude errors
1. Check API rate limits
2. Increase COOLDOWN_SECONDS
3. Review iteration logs

## Credits

- **Original Technique**: [Geoffrey Huntley](https://ghuntley.com/ralph/)
- **Concept**: The Simpsons character who persists despite setbacks
- **Philosophy**: "Iteration > Perfection"

## Sources

- [Official Claude Code Plugin](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)
- [How to Ralph Wiggum](https://github.com/ghuntley/how-to-ralph-wiggum)
- [Ralph Explained](https://blog.devgenius.io/ralph-wiggum-explained-the-claude-code-loop-that-keeps-going-3250dcc30809)
