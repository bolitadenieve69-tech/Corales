import sys
import os

sys.path.append(os.getcwd())

from core.database import Base
from models import *
from sqlalchemy import create_engine
from sqlalchemy.schema import CreateTable
from sqlalchemy.dialects import postgresql

def get_ddl():
    engine = create_engine('postgresql://')
    output = []
    # Ordener de tablas para evitar problemas de FK
    for table in Base.metadata.sorted_tables:
        ddl = CreateTable(table).compile(dialect=postgresql.dialect())
        output.append(str(ddl) + ";")
    return "\n\n".join(output)

if __name__ == "__main__":
    print(get_ddl())
