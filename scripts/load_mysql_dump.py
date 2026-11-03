#!/usr/bin/env python3
"""Load a phpMyAdmin/mysqldump SQL file into a SQLite database for inspection.

No MySQL server needed. Column types are kept loosely (SQLite is dynamically
typed); only column names and data are preserved, which is all the migration needs.

Usage: python3 scripts/load_mysql_dump.py <dump.sql> <out.sqlite>
"""
import re
import sqlite3
import sys

ESCAPES = {"0": "\0", "b": "\b", "n": "\n", "r": "\r", "t": "\t", "Z": "\x1a"}


def parse_values(s, i):
    """Parse `(v, v, ...), (...);` starting at s[i]. Returns (rows, index after ';')."""
    rows, n = [], len(s)
    while True:
        while s[i] in " \t\r\n,":
            i += 1
        if s[i] == ";":
            return rows, i + 1
        assert s[i] == "(", f"expected '(' at {i}: {s[i:i+40]!r}"
        i += 1
        row = []
        while True:
            while s[i] in " \t\r\n":
                i += 1
            c = s[i]
            if c == "'":
                i += 1
                buf = []
                while True:
                    j = s.find("'", i)
                    k = s.find("\\", i, j)
                    if k != -1:  # backslash escape before the next quote
                        buf.append(s[i:k])
                        nxt = s[k + 1]
                        buf.append(ESCAPES.get(nxt, nxt))
                        i = k + 2
                        continue
                    buf.append(s[i:j])
                    if j + 1 < n and s[j + 1] == "'":  # doubled quote
                        buf.append("'")
                        i = j + 2
                        continue
                    i = j + 1
                    break
                row.append("".join(buf))
            else:
                m = re.compile(r"[^,)]+").match(s, i)
                tok = m.group(0).strip()
                i = m.end()
                if tok.upper() == "NULL":
                    row.append(None)
                elif tok.lower().startswith("0x"):
                    row.append(bytes.fromhex(tok[2:]))
                else:
                    try:
                        row.append(int(tok))
                    except ValueError:
                        row.append(float(tok))
            while s[i] in " \t\r\n":
                i += 1
            if s[i] == ",":
                i += 1
                continue
            assert s[i] == ")", f"expected ')' at {i}: {s[i:i+40]!r}"
            i += 1
            rows.append(row)
            break


def main(src, dst):
    s = open(src, encoding="utf-8", errors="surrogateescape").read()
    db = sqlite3.connect(dst)
    for m in re.finditer(r"^CREATE TABLE `(\w+)` \((.*?)\n\)[^;]*;", s, re.M | re.S):
        cols = re.findall(r"^\s*`(\w+)`", m.group(2), re.M)
        db.execute(f'DROP TABLE IF EXISTS "{m.group(1)}"')
        db.execute(f'CREATE TABLE "{m.group(1)}" ({", ".join(chr(34)+c+chr(34) for c in cols)})')
    ins = re.compile(r"^INSERT INTO `(\w+)` \(([^)]*)\) VALUES", re.M)
    pos, counts = 0, {}
    while (m := ins.search(s, pos)):
        table = m.group(1)
        cols = [c.strip(" `") for c in m.group(2).split(",")]
        rows, pos = parse_values(s, m.end())
        q = f'INSERT INTO "{table}" ({", ".join(chr(34)+c+chr(34) for c in cols)}) VALUES ({",".join("?"*len(cols))})'
        db.executemany(q, rows)
        counts[table] = counts.get(table, 0) + len(rows)
    db.commit()
    for t, c in sorted(counts.items()):
        print(f"{t:40s} {c}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
