from datetime import datetime
from peewee import *

# Use SQLite database
db = SqliteDatabase('shortest_hack.db')

class BaseModel(Model):
    class Meta:
        database = db

class Project(BaseModel):
    name = CharField()
    html_content = TextField(default='')
    initial_prompt = TextField(null=True)
    created_at = DateTimeField(default=datetime.now)

class Message(BaseModel):
    project = ForeignKeyField(Project, backref='messages', on_delete='CASCADE')
    role = CharField()  # 'user' or 'assistant'
    content = TextField()
    processed = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.now)

    class Meta:
        order_by = ('created_at',) 