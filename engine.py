import pandas as pd
import os
from os.path import exists
import numpy as np
from graphs import get_graphs

NOT_STARTED_FILTER = ['provider-name', 'department', 'date-signed', 'duration', 'date-end-validity',
                                    'date-start-planning', 'days-reserved-planning', 'date-recommended-send', 'lights', 'current-status']
STARTED_FILTER = ['provider-name', 'department', 'date-signed', 'duration', 'date-end-validity',
                                    'date-start-planning', 'days-reserved-planning', 'date-recommended-send',
                                    'date-prices-offer', 'date-prices-map', 'lights', 'current-status']
SENT_FILTER = ['provider-name', 'department', 'percentage-sent-late', 'date-signed', 'duration', 'date-end-validity',
                                    'date-start-planning', 'days-reserved-planning', 'date-recommended-send',
                                    'date-prices-offer', 'date-prices-map', 
                                    'date-sent', 'days-planning-to-sent', 'current-status']
CONCLUDED_FILTER = ['provider-name', 'department', 'indicator-done-after-end-date', 'percentage-sent-late', 'date-signed', 'duration', 'date-end-validity',
                                    'date-start-planning', 'days-reserved-planning', 'date-recommended-send',
                                    'date-prices-offer', 'date-prices-map', 
                                    'date-sent', 'date-concluded', 'days-planning-to-sent', 'current-status']

def handle_csv_file(file_path, TEMPORARY_FOLDER_FULLPATH):
    dfDisplay = None
    CACHE_FILE_NAME = os.path.join(TEMPORARY_FOLDER_FULLPATH, "processed-db-cache.csv")
    
    if(exists(CACHE_FILE_NAME)):
        print("\nLog: Opened cached DataFrame")
        dfDisplay = pd.read_csv(CACHE_FILE_NAME)
    else:
        print("\nLog: Processed DataFrame")
        dfDisplay = process_csv_File(file_path)  
        if isinstance(dfDisplay, pd.DataFrame):
            dfDisplay.to_csv(CACHE_FILE_NAME, index=False)
        else:
            return None
    return build_display_package(dfDisplay, file_path, TEMPORARY_FOLDER_FULLPATH)   

def build_display_package(dfDisplay, file_path, TEMPORARY_FOLDER_FULLPATH):

    dfNotStarted, dfStarted, dfSent, dfConcluded = get_tables(dfDisplay)
    excel_path = saveExcelFile(dfDisplay, file_path, TEMPORARY_FOLDER_FULLPATH)

    graph1_1, graph1_2, graph2_1, graph2_2, graph3_1, graph3_2, graph4_1, graph4_2 = get_graphs(dfDisplay)

    return {
        "tableNotStarted": {
            "table":dfNotStarted.to_html(classes="table_style", index=False),
            "name":"not-started"
        },
        "tableStarted": {
            "table":dfStarted.to_html(classes="table_style", index=False),
            "name":"started"
        },
        "tableSent": {
            "table":dfSent.to_html(classes="table_style", index=False),
            "name":"sent"
        },
        "tableConcluded": {
            "table":dfConcluded.to_html(classes="table_style", index=False),
            "name":"concluded"
        },
        "graph1_1":graph1_1,
        "graph1_2":graph1_2,
        "graph2_1":graph2_1,
        "graph2_2":graph2_2,
        "graph3_1":graph3_1,
        "graph3_2":graph3_2,
        "graph4_1":graph4_1,
        "graph4_2":graph4_2,
        "excel": excel_path
        }
    
def get_tables(dfDisplay):
    dfNotStarted = dfDisplay[dfDisplay['current-status'] == 'not-started']
    dfNotStarted = dfNotStarted[NOT_STARTED_FILTER]
    # ---------------------------------
    dfStarted = dfDisplay[dfDisplay['current-status'] == 'started']
    dfStarted = dfStarted[STARTED_FILTER]
    # ---------------------------------
    dfSent = dfDisplay[dfDisplay['current-status'] == 'sent']
    dfSent = dfSent[SENT_FILTER]
    # ---------------------------------
    dfConcluded = dfDisplay[dfDisplay['current-status'] == 'concluded']
    dfConcluded = dfConcluded[CONCLUDED_FILTER] 
    return (dfNotStarted, dfStarted, dfSent, dfConcluded)

def saveExcelFile(dfDisplay, file_path, TEMPORARY_FOLDER_FULLPATH):
    excel_file_name = (os.path.basename(file_path).split(".")[0] + "_excel.xlsx")
    excel_fullpath = os.path.join(TEMPORARY_FOLDER_FULLPATH, excel_file_name)
    dfDisplay.to_excel(excel_fullpath)
    return TEMPORARY_FOLDER_FULLPATH.split('\\')[-1] + '/' + excel_file_name

def process_csv_File(file_path):
    try:
        df = pd.read_csv(file_path, header=None)
    
    # input
    # provider | department | date signed contract | duration | date to start planning | current-status
    # | date sent to analysis | date concluded | date prices offer received | date prices map finalized
        df.columns = ['provider-name', 'department', 'date-signed','duration','date-start-planning', 'current-status', 
                'date-prices-offer', 'date-prices-map', 'date-sent', 'date-concluded'] # meta
    except:
        return None
    
    # Transform all dates to timestamp format
    df['date-concluded'] = pd.to_datetime(df['date-concluded'], errors="coerce")
    df['date-sent'] = pd.to_datetime(df['date-sent'], errors="coerce")
    df['date-signed'] = pd.to_datetime(df['date-signed'])
    df['date-start-planning'] = pd.to_datetime(df['date-start-planning'], errors="coerce")
        
    # Calc end date (signed date + duration)
    df['date-end-validity'] = pd.Series(dtype="datetime64[ns]")
    for data_assinatura, vigencia, index in zip(df["date-signed"], df['duration'], range(0, df.shape[0])):
        df.at[index, 'date-end-validity'] = data_assinatura + pd.DateOffset(months=vigencia)
  
    # Generate recommeded date to send to analysis (120 days before end date)
    df["date-recommended-send"] = df['date-end-validity'] - pd.DateOffset(days=120)

    # Calc amount of days reserved for planning (Date signed -> Date recommended to be sent)
    df["days-reserved-planning"] = (df['date-recommended-send'] - df['date-start-planning']).dt.days
    # Calc amount of days from TODAY until date recommended to be sent
    df['days-remaining-to-duedate-send'] = (df['date-recommended-send'] - pd.to_datetime("now")).astype('timedelta64[D]').astype(int)
    # Gen lights
    df['lights'] = pd.Series(dtype="object")
    for days_total, days_remaining, index in zip(df["days-reserved-planning"], df['days-remaining-to-duedate-send'], range(0, df.shape[0])):
        df.at[index, 'lights'] = calcLights(days_total, days_remaining) + calcTime(days_remaining)
    
    df['percentage-sent-late'] = pd.Series(dtype="object")
    for val, index in zip((df['date-sent'] - df["date-recommended-send"]), range(0, df.shape[0])):
        try:
            val = round(val.days / 120 * 10000) / 100
            if val <= 0:
                df.at[index, 'percentage-sent-late'] = 0
            else:
                df.at[index, 'percentage-sent-late'] = val
        except:
            df.at[index, 'percentage-sent-late'] = 0
            
    df['indicator-done-after-end-date'] = pd.Series(dtype="object")
    for date_conclusion, date_end, index in zip(df['date-concluded'], df['date-end-validity'], range(0, df.shape[0])):
        try:
            if pd.isnull(date_conclusion):
                df.at[index, 'indicator-done-after-end-date'] = np.NaN
            elif date_conclusion > date_end:
                df.at[index, 'indicator-done-after-end-date'] = "yes"
            else:
                df.at[index, 'indicator-done-after-end-date'] = "no"
        except:
           df.at[index, 'indicator-done-after-end-date'] = np.NaN
    
    df['days-planning-to-sent'] = pd.Series(dtype="object")
    for val, index in zip((df['date-sent'] - df['date-start-planning']), range(0, df.shape[0])):
        try:
            df.at[index, 'days-planning-to-sent'] = val.days
        except:
           df.at[index, 'indicator-done-after-end-date'] = np.NaN
        
    df['date-concluded'] = df['date-concluded'].dt.strftime('%d/%m/%Y')
    df['date-sent'] = df['date-sent'].dt.strftime('%d/%m/%Y')
    df['date-signed'] = df['date-signed'].dt.strftime('%d/%m/%Y')
    df['date-end-validity'] = df['date-end-validity'].dt.strftime('%d/%m/%Y')
    df['date-recommended-send'] = df['date-recommended-send'].dt.strftime('%d/%m/%Y')
    df['date-start-planning'] = df['date-start-planning'].dt.strftime('%d/%m/%Y')
    
    return df

def calcTime(days):
    time = ""
    if days == 1 or days == -1:
        time += "%s day" % days
    else:
        time += "%s days" % days


    if time == "1 dia" or time == "-1 dia":
        time += " remaining"
    else:
        time += " remaining"
    return time

def calcLights(days_total, days_remaining):
    if days_total < 0 or days_remaining < 0:
        return "Purple"
    elif(days_remaining > (days_total/2)):
        return "Green"
    elif(days_remaining <= (days_total/2) and days_remaining >= (days_total/4)):
        return "Yellow"
    else:
        return "Red"
    

# pd.set_option("display.max_rows", None, "display.max_columns", None) 
# print(process_csv_File("database.csv"))