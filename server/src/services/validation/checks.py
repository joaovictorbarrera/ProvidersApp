from datetime import datetime

def checkName(name) -> "tuple[bool, str]":
    if name == "":
        return (False, "name is required")
    
    return (True, None)

def checkDep(dep) -> "tuple[bool, str]":
    if dep == "":
        return (False, "department is required")
    
    if dep != 'INFRASTRUCTURE-DEP' and dep != 'CORP-DEP' and dep != 'DEVELOPMENT-DEP':
        return (False, "invalid department")
                
    return (True, None)

def checkDate(date, name, required=False) -> "tuple[bool, str]":
    if date == "":
        if required:
            return (False, f"{name} is required")
        else:
            return (True, None)
    
    if not validDate(date):
        return (False, f"{name} is invalid date")
    
    return (True, None)

def checkDuration(duration: str) -> "tuple[bool, str]":
    if duration == "":
        return (False, "duration is required")
    
    if not duration.isdecimal():
        return (False, "duration is not a number")
    
    if int(duration) < 1:
        return (False, "duration is too small")
    
    return (True, None)

def checkStatus(status) -> "tuple[bool, str]":
    if status == "":
        return (False, "status is required")
    
    validStatuses = {'not-started', 'started', 'sent', 'concluded'}
    
    if status not in validStatuses:
        return (False, "invalid status")
    
    return (True, None)

def validDate(date: str):
    try:
        datetime.strptime(date, '%d/%m/%Y')
        return True
    except:
        pass
    try:
        datetime.strptime(date, '%Y-%m-%d')
        return True
    except:
        return False