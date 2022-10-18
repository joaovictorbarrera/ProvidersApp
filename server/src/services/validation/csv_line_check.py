
from src.services.validation.checks import checkName, checkDep, checkDate, checkDuration, checkStatus

def validateCSV(path: str) -> "tuple[bool, list[str], str]":
    try:
        lines = parseCSV(path)
        for line in lines:
            line = line.strip("\n") 
            valid, errors = validateLine(line)
            if not valid:
                return (False, errors, line)
        return (True, None, None)
    except:
        return (False, ["Could not validate"], None)

def parseCSV(path: str) -> "list[str]":
    with open(path, 'r') as f:
        lines = f.readlines()
        return lines

def parseLine(line: str) -> "list[str]":
    line = line + ","
    left = 0
    values = []
    ignoreComma = False
    for runner in range(len(line)):
        c = line[runner]
        
        if line == '"':
            ignoreComma = not ignoreComma
            
        if c == ',' and not ignoreComma:
            value = line[left:runner]
            if value.startswith('"') and value.endswith('"'):
                value = value[1: len(value) - 1]
            values.append(value)
            left = runner + 1
    return values

def validateLine(line: str) -> "tuple[bool, list[str]]":
    values = parseLine(line)
    
    if len(values) != 10:
        return (False, ["Invalid number of elements"])
    
    errors = []
    
    # required
    nameValid, msg = checkName(values[0])
    errors.append(msg) if not nameValid else None
    
    depValid, msg = checkDep(values[1])
    errors.append(msg) if not depValid else None
    
    dateSignedValid, msg = checkDate(values[2], "date signed", required=True)
    errors.append(msg) if not dateSignedValid else None
    
    durationValid, msg = checkDuration(values[3])
    errors.append(msg) if not durationValid else None
    
    planningStartsValid, msg = checkDate(values[4], "date planning starts", required=True)
    errors.append(msg) if not planningStartsValid else None
    
    statusValid, msg = checkStatus(values[5])
    errors.append(msg) if not statusValid else None
    
    
    # optional
    offerReceivedValid, msg = checkDate(values[6], "date offer received")
    errors.append(msg) if not offerReceivedValid else None
    
    mapConcludedValid, msg = checkDate(values[7], "date map concluded")
    errors.append(msg) if not mapConcludedValid else None
    
    sentValid, msg = checkDate(values[8], "date sent")
    errors.append(msg) if not sentValid else None
    
    conclusionValid, msg = checkDate(values[9], "date conclusion")
    errors.append(msg) if not conclusionValid else None
    
    return (len(errors) <= 0, errors)