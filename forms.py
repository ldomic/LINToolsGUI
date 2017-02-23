from flask_wtf import Form
from wtforms import TextField, IntegerField, FileField, SubmitField,  FloatField,RadioField,SelectField
from wtforms.fields.html5 import DecimalRangeField
from wtforms import validators, ValidationError

class Lintools_Input(Form):
   #Gender = RadioField('Gender', choices = [('M','Male'),('F','Female')])
   trajectory = TextField()

   #email = TextField("Email",[validators.Required("Please enter your email address."),
    #  validators.Email("Please enter your email address.")])

   cutoff = DecimalRangeField('Cutoff',  default=3.5)
   offset = IntegerField("Residue offset",default = 0)
   analysis_cutoff = FloatField("Analysis cutoff",default = 0.3)
   language = SelectField('Languages', choices = [('cpp', 'C++'), ('py', 'Python')])
   submit = SubmitField("Send")
   calculate = SubmitField("Calculate")
class Ligand(Form):
    ligand = SelectField()
