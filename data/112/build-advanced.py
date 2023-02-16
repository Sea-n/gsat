#!/usr/bin/env python3

import os
import re


def main():
    html_dir = 'html'
    for ent in os.scandir(html_dir):
        with open(ent) as f:
            content = f.readlines()
            depid = ent.name[:5]
            print(depid, end='\t')

            [colname, depname] = content[175][12:-15].split('-', 1)

            marks = {}
            multi = {}
            for line in content:
                if '標)<br>' in line:
                    [subj, mark] = re.search(r'<li>([^&]+).*?\((.*)\)<br>',
                                             line).groups()
                    marks[subj.replace('\u3000', '')] = mark

                if '&nbsp; x ' in line:
                    [subj, cat, n] = re.search(r'(.+)\((.+)\).* ([0-9.]{4,})',
                                               line).groups()
                    if cat == '分科':
                        multi[subj.replace('\u3000', '')] = f'x{n}'

            for s in ['國文', '英文', '數學A', '數學B', '社會', '自然']:
                print(marks[s][0] if s in marks else '無', end='')
            print('', end='\t')

            for s in ['國文', '英文', '數學甲', '數學乙', '物理',
                      '化學', '生物', '歷史', '地理', '公民']:
                print(multi[s] if s in multi else '--', end=' ')
            print('', end='\t')

            depname = depname.replace('(', '（').replace(')', '）')
            depname = re.sub(r'(學系|學程|學士班)\-?([^（）〈〉]*)組',
                             r'\1（\2組）', depname)
            depname = re.sub(r'系\-?(.*)組$',
                             r'系（\1組）', depname)
            depname = re.sub(r'\-(.*)組$',
                             r'（\1組）', depname)

            print(colname, depname, sep='\t')


if __name__ == '__main__':
    main()
