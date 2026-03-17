import sys
import os

# Adds the current app path to sys.path
sys.path.append(os.getcwd())

from core.database import Base
from models import * # Ensures all models are registered
from sqlalchemy import create_mock_engine

def dump_schema(sql, *multiparams, **params):
    print(sql.compile(dialect=engine.dialect))

engine = create_mock_engine("postgresql://", dump_schema)
Base.metadata.create_all(engine)
