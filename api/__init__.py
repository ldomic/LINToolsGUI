from flask import Flask, jsonify

app = Flask(__name__)

app.config.from_object('project.config.DevelopmentConfig')
