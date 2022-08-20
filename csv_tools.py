def get_csv_data(path):
    with open(path, 'r') as f:
        lines = f.readlines()
        return list(map(lambda x: x.replace("\n", ""), lines))  
              
def update_csv(path, csv_parts):
    line = ",".join(csv_parts.values())
    with open(path, 'a') as f:
        f.write(line+"\n") 
        
def delete_csv_line(path, line):
    with open(path, 'r+') as f:
        lines = f.readlines()
        lines = list(filter(lambda x: line not in x, lines))
        f.seek(0)
        f.truncate()
        f.writelines(lines)