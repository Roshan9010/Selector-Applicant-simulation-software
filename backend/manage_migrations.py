#!/usr/bin/env python3
"""Helper script to run common Alembic commands from the project root.

Usage examples:
  python manage_migrations.py current
  python manage_migrations.py upgrade head
  python manage_migrations.py downgrade -1
  python manage_migrations.py revision --autogenerate -m "msg"
"""
import argparse
import subprocess
import sys
import os


def run_cmd(cmd_args):
    try:
        print('$', ' '.join(cmd_args))
        res = subprocess.run(cmd_args, check=False)
        return res.returncode
    except FileNotFoundError:
        print('alembic not found. Ensure alembic is installed in your environment.')
        return 2


def main():
    parser = argparse.ArgumentParser(description='Manage Alembic migrations (wrapper)')
    parser.add_argument('action', help='alembic action: current|upgrade|downgrade|revision')
    parser.add_argument('arg', nargs='?', help='argument for action (e.g., head, -1, message)')
    parser.add_argument('--autogenerate', action='store_true', help='use --autogenerate for revision')
    parser.add_argument('-m', '--message', help='message for revision')

    args = parser.parse_args()

    # Ensure we run from backend directory so alembic.ini is found
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    action = args.action

    if action == 'current':
        return run_cmd([sys.executable, '-m', 'alembic', 'current'])

    if action == 'upgrade':
        target = args.arg or 'head'
        return run_cmd([sys.executable, '-m', 'alembic', 'upgrade', target])

    if action == 'downgrade':
        target = args.arg or '-1'
        return run_cmd([sys.executable, '-m', 'alembic', 'downgrade', target])

    if action == 'revision':
        cmd = [sys.executable, '-m', 'alembic', 'revision']
        if args.autogenerate:
            cmd.append('--autogenerate')
        if args.message:
            cmd += ['-m', args.message]
        elif args.arg:
            # allow passing -m message as positional arg
            cmd += ['-m', args.arg]
        else:
            print('Revision requires a message via -m "your message"')
            return 1
        return run_cmd(cmd)

    print('Unknown action:', action)
    return 1


if __name__ == '__main__':
    sys.exit(main())
