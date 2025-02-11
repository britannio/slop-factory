#!/usr/bin/env python3
import sqlite3
import argparse
import sys

def escape_value(value):
    """
    Convert a Python value into a PostgreSQL literal.
    - Strings are wrapped in single quotes with embedded single quotes doubled.
    - None is converted to SQL NULL.
    - Numbers and other types are simply converted to strings.
    """
    if value is None:
        return "NULL"
    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"
    return str(value)

def main():
    parser = argparse.ArgumentParser(
        description="Convert SQLite 'project' table rows into PostgreSQL INSERT statements for the 'projects' table, using auto-generated IDs."
    )
    parser.add_argument("sqlite_db", help="Path to the SQLite database file.")
    parser.add_argument("--output", "-o", help="Optional output file for the INSERT statements (default: stdout)", default=None)
    args = parser.parse_args()

    # Connect to the SQLite database
    conn = sqlite3.connect(args.sqlite_db)
    cursor = conn.cursor()

    # Query all rows from the SQLite table "project" without selecting the 'id' column.
    query = """
        SELECT name, html_content, initial_prompt, created_at
        FROM project
    """
    cursor.execute(query)
    rows = cursor.fetchall()

    # Determine output destination: either a file or stdout.
    out_file = open(args.output, "w", encoding="utf-8") if args.output else sys.stdout

    # Process each row and output an INSERT statement without the 'id' column.
    for row in rows:
        values = [escape_value(value) for value in row]
        insert_stmt = (
            "INSERT INTO public.projects (name, html_content, initial_prompt, created_at) "
            f"VALUES ({', '.join(values)});"
        )
        out_file.write(insert_stmt + "\n")

    if args.output:
        out_file.close()

    # Close the SQLite connection.
    conn.close()

if __name__ == "__main__":
    main()
