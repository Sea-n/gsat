#!/usr/bin/env python3

import os
import re


# wget -r -nc -R pdf --header "User-Agent: Sean" \
# "https://$htmldir/../TotalGsdShow.htm"
def main():
    html_dir = 'www.cac.edu.tw/apply112/system' \
             + '/6ColQry_forh112apply_8wzk94tv/html'
    for ent in os.scandir(html_dir):
        if '.htm?v=1.0' not in ent.name:
            continue
        with open(ent) as f:
            content = f.readlines()
            ln = 0

            while 'class="colname"' not in content[ln]:
                ln = ln + 1
            colname = re.search('class="colname">(.*?)<', content[ln]).group(1)

            while 'class="gsdname"' not in content[ln]:
                ln = ln + 1
            gsdname = re.search('class="gsdname">(.*?)<', content[ln]).group(1)

            while '>校系代碼<' not in content[ln]:
                ln = ln + 1
            depid = content[ln + 1].strip(' \t\n')[59:-5]

            subj = content[ln + 2].strip(' \t\n')[82:-5].split('<br>')
            mark = content[ln + 3].strip(' \t\n')[70:-5].split('<br>')
            multi = content[ln + 4].strip(' \t\n')[71:-5].split('<br>')
            weighted = content[ln + 5].strip(' \t\n')[60:-5].split('<br>')

            table = {}
            for k in range(len(subj)):
                table[subj[k]] = (mark[k] if mark[k] != '--' else
                                  ('x' + multi[k] if multi[k] != '--' else
                                   ('採計' if weighted[k] != '--' else '--')))
            print(depid, end='\t')

            for s in ['國文', '英文', '數學A', '數學B', '社會', '自然']:
                if s in table and table[s][1] == '標':
                    print(table[s][0], end='')
                else:
                    print('無', end='')
            print('', end='\t')

            for s in ['國文', '英文', '數學A', '數學B', '社會', '自然']:
                print(table[s] if s in table else '--', end=' ')
            print('', end='\t')

            gsdname = gsdname.replace('(', '（').replace(')', '）')
            gsdname = re.sub(r'(學系|學程|學士班)\-?([^（）〈〉]*)組',
                             r'\1（\2組）', gsdname)
            gsdname = re.sub(r'系\-?(.*)組$',
                             r'系（\1組）', gsdname)
            gsdname = re.sub(r'\-(.*)組$',
                             r'（\1組）', gsdname)

            print(colname, gsdname, sep='\t')


if __name__ == '__main__':
    main()
