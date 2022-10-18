def get_csv_data(path):
    with open(path, 'r') as f:
        lines = f.readlines()
        return list(map(lambda x: x.replace("\n", ""), lines))  
              
def append_line_to_csv(path, line):
    with open(path, 'a') as f:
        f.write(line+"\n") 
        
def delete_csv_line(path, index):
    if index < 0:
        return {"error": True, "message": "Index too low"}
    
    with open(path, 'r+') as f:
        lines = f.readlines()
        if index >= len(lines):
            return {"error": True, "message": "Index too high"}
        lines.pop(index)
        f.seek(0)
        f.truncate()
        f.writelines(lines)
        
    return {"error":False}