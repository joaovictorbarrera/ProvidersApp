from re import A
import plotly.express as px
import pandas as pd
COLORS = ['#005051',"#DD4F05", "#000000"]

def get_graphs(dfDisplay):
    graph1_1 = get_bar_graph_amount_per_status(dfDisplay)
    graph1_2 = get_bar_graph_percentage_delay(dfDisplay)
    graph2_1 = get_bar_graph_conclusion_after_deadline_indicator(dfDisplay)
    graph2_2 = get_pie_chart_delayed_vs_ontime(dfDisplay)
    graph3_1 = get_graph_department_days_planning_sent(dfDisplay, "DEVELOPMENT-DEP")
    graph3_2 = get_graph_department_days_planning_sent(dfDisplay, "INFRASTRUCTURE-DEP")
    graph4_1 = get_graph_department_days_planning_sent(dfDisplay, "CORP-DEP")
    graph4_2 = get_graph_department_days_planning_sent(dfDisplay, all=True)
    return (
        graph1_1,
        graph1_2,
        graph2_1,
        graph2_2,
        graph3_1,
        graph3_2,
        graph4_1,
        graph4_2
        )


def get_bar_graph_amount_per_status(dfDisplay):
    
    vals = [dfDisplay[dfDisplay['current-status'] == 'not-started'].shape[0],
            dfDisplay[dfDisplay['current-status'] == 'started'].shape[0],
            dfDisplay[dfDisplay['current-status'] == 'sent'].shape[0],
            dfDisplay[dfDisplay['current-status'] == 'concluded'].shape[0]
            ]

    return px.bar(y=vals,
                      x=['not-started','started','sent','concluded'], 
                      text_auto=True, 
                      title="Amount of providers per status",
                      labels=dict(x="Status", y="Amount"), 
                      color_discrete_sequence=COLORS).to_html(include_plotlyjs=False, full_html=False)
    
def get_bar_graph_percentage_delay(dfDisplay):
    dfAtraso = dfDisplay[dfDisplay['percentage-sent-late'] != 0]
    dfAtraso = dfAtraso[['provider-name','percentage-sent-late', 'current-status']]
    return px.bar(dfAtraso, y='percentage-sent-late',
                      x='provider-name', 
                      color='current-status', 
                      text_auto=True, title="Percentage late to send", 
                      labels=dict(x="Provider", y="Percentage"),
                      color_discrete_sequence=COLORS).to_html(include_plotlyjs=False, full_html=False)
    
def get_bar_graph_conclusion_after_deadline_indicator(dfDisplay):
    dfIndicator = dfDisplay[['percentage-sent-late', 'indicator-done-after-end-date']]
    dfIndicator = dfIndicator[(dfIndicator['indicator-done-after-end-date'] == "no") | 
                              (dfIndicator['indicator-done-after-end-date'] == "yes")]
    return px.bar(x=["No, sent late","Yes, sent late", "No, sent on time","Yes, sent on time"], 
                      y=[dfIndicator[(dfIndicator['indicator-done-after-end-date'] == "no") & (dfIndicator['percentage-sent-late'] != 0)].shape[0],
                        dfIndicator[(dfIndicator['indicator-done-after-end-date'] == "yes") & (dfIndicator['percentage-sent-late'] != 0)].shape[0],
                        dfIndicator[(dfIndicator['indicator-done-after-end-date'] == "no") & (dfIndicator['percentage-sent-late'] == 0)].shape[0],
                        dfIndicator[(dfIndicator['indicator-done-after-end-date'] == "yes") & (dfIndicator['percentage-sent-late'] == 0)].shape[0]
                        ], text_auto=True, title="Concluded after due date?",
                      labels=dict(x="Result", y="Amount"),
                      color_discrete_sequence=COLORS).to_html(include_plotlyjs=False, full_html=False)

def get_pie_chart_delayed_vs_ontime(dfDisplay):
    dfPie = pd.DataFrame(data={"Type":["Late", "On Time"], "Amount":[
        dfDisplay[dfDisplay['percentage-sent-late'] != 0].shape[0],
        dfDisplay[dfDisplay['percentage-sent-late'] == 0].shape[0]
        ]})
    return px.pie(dfPie, 
                      values="Amount", 
                      names="Type",
                      title="Sent On Time",
                      color_discrete_sequence=COLORS).to_html(include_plotlyjs=False, full_html=False)
    
def get_graph_department_days_planning_sent(dfDisplay, department=None, all=False):
    dfDisplay = dfDisplay[(dfDisplay['current-status'] == 'sent') | (dfDisplay['current-status'] == 'concluded')]
    
    title = ": Days from start of planning until sent"
    if all and department is None:
        title = "All" + title
    elif not all and department:
        title = department + title
        dfDisplay = dfDisplay[dfDisplay["department"] == department]
    else:
        return "ERROR!"
    colors = ['#005051',"#DD4F05", "#000000"]
    fig = px.bar(dfDisplay, x="provider-name", 
                 y='days-planning-to-sent', 
                 text_auto=True, 
                 color_discrete_sequence=colors, 
                 title=title,
                 labels=dict(x="Provider", y="Days", color="Id"))
    
    days = dfDisplay['days-planning-to-sent'].mean()
    if days == days:
        annotation = "Average: " + days_to_full_desc(round(days))
        fig.add_hline(y=days, 
                  line_color="#DD4F05", 
                  line_width=4,
                  line_dash="dash",
                  annotation_text=annotation,
                  annotation_position="top left", 
                  annotation_font_size=20,
                  annotation_font_color="white",
                  annotation_bgcolor="#DD4F05",
                  name="mean")
    
    return fig.to_html(include_plotlyjs=False, full_html=False)

def days_to_full_desc(dias):
    tempo = ""
    qnt_dias = None
    qnt_meses = None
    qnt_anos = None
    
    # calc vars
    if dias >= 365:
        qnt_anos = dias // 365
        dias = dias % 365
    if dias >= 30:
        qnt_meses = dias // 30
        dias = dias % 30
    if dias != 0 or (qnt_meses == None and qnt_anos == None):
        qnt_dias = dias

    # add years
    if qnt_anos != None:
        if qnt_anos == 1:
            tempo += "1 year"
        else:
            tempo += "%s years" % qnt_anos

    # add months
    if qnt_meses != None:
        if qnt_anos != None:
            if qnt_dias == None:
               tempo += " and " 
            else:
                tempo += ", "
                
        if qnt_meses == 1:
            tempo += "1 month"
        else:
            tempo += "%s months" % qnt_meses

    # add days
    if qnt_dias != None:
        if qnt_meses != None or qnt_anos != None:
            tempo += " and "
            
        if qnt_dias == 1:
            tempo += "1 day"
        else:
            tempo += "%s days" % qnt_dias

    return tempo