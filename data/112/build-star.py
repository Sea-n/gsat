#!/usr/bin/env python3

import os
import re


# wget -r -nc -R pdf --header "User-Agent: Sean" \
# "https://$htmldir/../TotalGsdShow.htm"
def main():
    html_dir = 'www.cac.edu.tw/star112/system' \
             + '/8ColQry_xfor112Star_Z84eH3ep/html'
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
            gsdname = re.search('class="gsdname" .*?>(.*?)<',
                                content[ln]).group(1)

            while '>校系代碼<' not in content[ln]:
                ln = ln + 1
            depid = content[ln + 1].strip(' \t\n')[56:-5]
            print(depid, end='\t')

            mark = content[ln + 3].strip(' \t\n')[42:-5].split('<br>')
            for i in range(6):
                print(mark[i][0] if mark[i][1] == '標' else '無', end='')
            print('', end='\t')

            for i in range(6):
                print(mark[i], end=' ')
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
